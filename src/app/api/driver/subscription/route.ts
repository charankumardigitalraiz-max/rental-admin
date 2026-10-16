import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import Subscription from "@/models/subscription";
import DriverSubscription from "@/models/driverSubscription";
import Transaction from "@/models/transaction";
import { verifyDriver } from "@/lib/auth";

/**
 * Format subscription document for response
 */
function formatDriverSubscription(doc: any) {
    const raw = doc && typeof doc.toObject === "function" ? doc.toObject() : doc;
    if (!raw) return null;
    const id = raw._id ? raw._id.toString() : raw.id;

    const now = new Date();
    const expiry = new Date(raw.expiryDate);
    const msDiff = expiry.getTime() - now.getTime();
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    let computedStatus = raw.subscriptionStatus || "Active";
    if (daysLeft < 0) {
        computedStatus = "Expired";
    } else if (daysLeft <= 3 && computedStatus === "Active") {
        computedStatus = "Expiring Soon";
    }

    return {
        id,
        _id: id,
        driverId: raw.driverCustomId || (raw.driverId ? raw.driverId.toString() : ""),
        driverMongoId: raw.driverId ? raw.driverId.toString() : "",
        driverName: raw.driverName || "Driver",
        driverPhone: raw.driverPhone || "",
        driverAvatar: raw.driverAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        planId: raw.planId ? raw.planId.toString() : "",
        planName: raw.planName,
        amount: Number(raw.amount) || 0,
        durationDays: Number(raw.durationDays) || 30,
        billingCycle: raw.billingCycle || "monthly",
        features: raw.features || [],
        localEligible: Boolean(raw.localEligible),
        outstationEligible: Boolean(raw.outstationEligible),
        maxRequestsPerDay: Number(raw.maxRequestsPerDay) || 999,
        startDate: raw.startDate ? new Date(raw.startDate).toISOString().split("T")[0] : "",
        expiryDate: raw.expiryDate ? new Date(raw.expiryDate).toISOString().split("T")[0] : "",
        paymentStatus: raw.paymentStatus || "Successful",
        paymentMethod: raw.paymentMethod || "UPI / Card",
        transactionId: raw.transactionId || "",
        subscriptionStatus: computedStatus,
        bookingsReceived: Number(raw.bookingsReceived) || 0,
        completedBookings: Number(raw.completedBookings) || 0,
        daysLeft: Math.max(0, daysLeft),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

/**
 * GET /api/driver/subscription
 * Retrieves the current driver's subscription status and history.
 */
export async function GET(req: NextRequest) {
    try {
        const driverPayload: any = verifyDriver(req);
        if (!driverPayload?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Invalid or missing driver token" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const driverObjectId = new mongoose.Types.ObjectId(driverPayload.id);

        // Fetch all subscriptions for this driver, latest first
        const subscriptions = await DriverSubscription.find({ driverId: driverObjectId }).sort({ createdAt: -1 });

        // Find active subscription
        const now = new Date();
        const activeSubDoc = subscriptions.find((sub) => {
            return sub.subscriptionStatus === "Active" && new Date(sub.expiryDate) > now;
        });

        return NextResponse.json(
            {
                success: true,
                hasActiveSubscription: !!activeSubDoc,
                activeSubscription: activeSubDoc ? formatDriverSubscription(activeSubDoc) : null,
                subscriptions: subscriptions.map(formatDriverSubscription),
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error in GET /api/driver/subscription:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch driver subscription",
                error: error?.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/driver/subscription
 * Driver purchases/takes a subscription plan and saves it into the database.
 * Body options:
 * - planId: string (MongoDB ID of the Subscription plan)
 * - paymentMethod?: string (e.g., 'UPI', 'Card', 'NetBanking', 'Wallet')
 * - transactionId?: string (optional transaction/gateway reference)
 * - driverId?: string (optional fallback if token not provided, e.g., during testing)
 */
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const driverPayload: any = verifyDriver(req);
        const body = await req.json().catch(() => ({}));

        // Allow driver ID from token OR body (for flexibility / testing)
        const driverIdParam = driverPayload?.id || body.driverId;
        if (!driverIdParam) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized: Driver token or driverId is required to take a subscription",
                },
                { status: 401 }
            );
        }

        const { planId, paymentMethod = "UPI", transactionId } = body;

        if (!planId) {
            return NextResponse.json(
                { success: false, message: "planId is required to subscribe" },
                { status: 400 }
            );
        }

        // Validate Driver
        let driver;
        if (mongoose.Types.ObjectId.isValid(driverIdParam)) {
            driver = await Driver.findById(driverIdParam);
        }
        if (!driver) {
            driver = await Driver.findOne({
                $or: [{ driverId: driverIdParam }, { phone: driverIdParam }],
            });
        }

        if (!driver) {
            return NextResponse.json(
                { success: false, message: "Driver not found" },
                { status: 404 }
            );
        }

        // Validate Subscription Plan
        let plan;
        if (mongoose.Types.ObjectId.isValid(planId)) {
            plan = await Subscription.findById(planId);
        }
        if (!plan) {
            plan = await Subscription.findOne({ planName: planId });
        }

        if (!plan) {
            return NextResponse.json(
                { success: false, message: "Subscription plan not found" },
                { status: 404 }
            );
        }

        if (plan.status === false) {
            return NextResponse.json(
                { success: false, message: "This subscription plan is currently inactive" },
                { status: 400 }
            );
        }

        // Calculate subscription dates
        const startDate = new Date();
        const durationDays = Number(plan.durationDays) || 30;
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + durationDays);

        const subTxnId =
            transactionId || "SUBTXN-" + Math.floor(10000000 + Math.random() * 90000000);

        // Mark any previous active subscription for this driver as expired or replaced
        await DriverSubscription.updateMany(
            {
                driverId: driver._id,
                subscriptionStatus: "Active",
            },
            {
                $set: { subscriptionStatus: "Expired" },
            }
        );

        const driverFullName = `${driver.firstName || ""} ${driver.lastName || ""}`.trim() || "Driver";

        // Create new DriverSubscription record
        const newDriverSubscription = await DriverSubscription.create({
            driverId: driver._id,
            driverCustomId: driver.driverId || "",
            driverName: driverFullName,
            driverPhone: driver.phone || "",
            driverAvatar:
                driver.selfie ||
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            planId: plan._id,
            planName: plan.planName || "Driver Subscription Plan",
            amount: Number(plan.price) || 0,
            durationDays,
            billingCycle: plan.billingCycle || "monthly",
            features: plan.features || [],
            localEligible: plan.localEligible !== false,
            outstationEligible: plan.outstationEligible !== false,
            maxRequestsPerDay: Number(plan.maxRequestsPerDay) || 999,
            startDate,
            expiryDate,
            paymentStatus: "Successful",
            paymentMethod,
            transactionId: subTxnId,
            subscriptionStatus: "Active",
            bookingsReceived: 0,
            completedBookings: 0,
        });

        // Record a transaction for audit, financial ledger & subscription-payments
        try {
            await Transaction.create({
                transactionId: subTxnId,
                driverId: driver._id,
                subscriptionId: newDriverSubscription._id,
                planName: plan.planName || "Driver Subscription Plan",
                serviceType: "Driver Subscription",
                customerOrDriverName: driverFullName,
                amount: Number(plan.price) || 0,
                method: paymentMethod,
                payoutAmount: 0,
                platformCommission: Number(plan.price) || 0,
                status: "Success",
            });
        } catch (txnErr) {
            console.error("Failed to create transaction record for subscription:", txnErr);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Subscription purchased successfully! Pass is now active.",
                data: formatDriverSubscription(newDriverSubscription),
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating driver subscription:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create subscription",
                error: error?.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}
