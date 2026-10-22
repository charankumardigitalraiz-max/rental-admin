import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import DriverSubscription from "@/models/driverSubscription";
import { verifyDriver } from "@/lib/auth";

/**
 * Helper to format subscription data
 */
function formatSubscription(doc: any) {
    if (!doc) return null;
    const raw = typeof doc.toObject === "function" ? doc.toObject() : doc;
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
        id: raw._id?.toString() || raw.id,
        _id: raw._id?.toString() || raw.id,
        planId: raw.planId?.toString() || "",
        planName: raw.planName || "Driver Subscription Plan",
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
        paymentMethod: raw.paymentMethod || "UPI",
        transactionId: raw.transactionId || "",
        subscriptionStatus: computedStatus,
        daysLeft: Math.max(0, daysLeft),
        bookingsReceived: Number(raw.bookingsReceived) || 0,
        completedBookings: Number(raw.completedBookings) || 0,
        createdAt: raw.createdAt,
    };
}

/**
 * GET /api/driver/profile
 * Returns the logged-in driver's complete profile along with their subscription details.
 * Also supports ?driverId= query param as fallback for admin / testing.
 */
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const driverPayload: any = verifyDriver(req);
        const { searchParams } = new URL(req.url);
        const queryDriverId = searchParams.get("driverId") || searchParams.get("id");

        const targetId = driverPayload?.id || queryDriverId;

        if (!targetId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized: Driver token or driverId is required",
                },
                { status: 401 }
            );
        }

        let driver: any = null;
        if (mongoose.Types.ObjectId.isValid(targetId)) {
            driver = await Driver.findById(targetId);
        }
        if (!driver) {
            driver = await Driver.findOne({
                $or: [{ driverId: targetId }, { phone: targetId }, { email: targetId }],
            });
        }

        if (!driver) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Driver not found",
                },
                { status: 404 }
            );
        }

        // Fetch driver's subscriptions
        const subscriptions = await DriverSubscription.find({ driverId: driver._id })
            .sort({ createdAt: -1 })
            .lean();

        const now = new Date();
        const activeSubDoc = subscriptions.find((sub: any) => {
            return sub.subscriptionStatus === "Active" && new Date(sub.expiryDate) > now;
        });

        const activeSubscription = activeSubDoc ? formatSubscription(activeSubDoc) : null;
        const hasSubscription = !!activeSubscription;

        const driverObj = typeof driver.toObject === "function" ? driver.toObject() : driver;

        return NextResponse.json(
            {
                success: true,
                message: "Driver profile fetched successfully",
                data: {
                    ...driverObj,
                    id: driverObj._id?.toString(),
                    hasSubscription,
                    activeSubscription,
                    // allSubscriptions: subscriptions.map(formatSubscription),
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error in GET /api/driver/profile:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch driver profile",
                error: error?.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/driver/profile
 * Update driver profile details (e.g. name, address, bank details, isOnline, fcmToken, etc.)
 */
export async function PUT(req: NextRequest) {
    try {
        await connectToDatabase();

        const driverPayload: any = verifyDriver(req);
        const body = await req.json().catch(() => ({}));
        const targetId = driverPayload?.id || body.driverId || body.id;

        if (!targetId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized: Driver token or driverId is required",
                },
                { status: 401 }
            );
        }

        let driver: any = null;
        if (mongoose.Types.ObjectId.isValid(targetId)) {
            driver = await Driver.findById(targetId);
        }
        if (!driver) {
            driver = await Driver.findOne({
                $or: [{ driverId: targetId }, { phone: targetId }],
            });
        }

        if (!driver) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Driver not found",
                },
                { status: 404 }
            );
        }

        // Allowed update fields
        const allowedUpdates = [
            "firstName",
            "lastName",
            "address",
            "selfie",
            "bankName",
            "accountHolderName",
            "accountNumber",
            "ifscCode",
            "upiId",
            "passbookImage",
            "isOnline",
            "fcmToken",
            "aadhaarCardFront",
            "aadhaarCardBack",
            "drivingLicense",
        ];

        allowedUpdates.forEach((field) => {
            if (body[field] !== undefined) {
                driver[field] = body[field];
            }
        });

        await driver.save();

        // Fetch subscription status
        const subscriptions = await DriverSubscription.find({ driverId: driver._id })
            .sort({ createdAt: -1 })
            .lean();

        const now = new Date();
        const activeSubDoc = subscriptions.find((sub: any) => {
            return sub.subscriptionStatus === "Active" && new Date(sub.expiryDate) > now;
        });

        const activeSubscription = activeSubDoc ? formatSubscription(activeSubDoc) : null;
        const driverObj = typeof driver.toObject === "function" ? driver.toObject() : driver;

        return NextResponse.json(
            {
                success: true,
                message: "Driver profile updated successfully",
                data: {
                    ...driverObj,
                    id: driverObj._id?.toString(),
                    hasSubscription: !!activeSubscription,
                    activeSubscription,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error in PUT /api/driver/profile:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update driver profile",
                error: error?.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}
