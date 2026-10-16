import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import DriverSubscription from "@/models/driverSubscription";
import Driver from "@/models/driver";
import Subscription from "@/models/subscription";
import { verifyAdmin } from "@/lib/auth";

export function formatSubscriptionDoc(s: any) {
    const raw = s && typeof s.toObject === "function" ? s.toObject() : s;
    if (!raw) return null;

    const id = raw._id ? raw._id.toString() : (raw.id || String(Math.random()));
    const now = new Date();
    const expiry = raw.expiryDate ? new Date(raw.expiryDate) : null;

    let computedStatus = raw.subscriptionStatus || "Active";
    let daysLeft = 0;
    if (expiry && !isNaN(expiry.getTime())) {
        const msDiff = expiry.getTime() - now.getTime();
        daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
            computedStatus = "Expired";
        } else if (daysLeft <= 3 && computedStatus === "Active") {
            computedStatus = "Expiring Soon";
        }
    }

    return {
        id,
        _id: id,
        driverId: raw.driverCustomId || (raw.driverId ? raw.driverId.toString() : ""),
        driverMongoId: raw.driverId ? raw.driverId.toString() : "",
        driverName: raw.driverName || "Driver",
        driverAvatar:
            raw.driverAvatar ||
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        driverPhone: raw.driverPhone || "",
        planId: raw.planId ? raw.planId.toString() : "",
        planName: raw.planName || "Driver Monthly Pass",
        startDate: raw.startDate ? new Date(raw.startDate).toISOString().split("T")[0] : "",
        expiryDate: raw.expiryDate ? new Date(raw.expiryDate).toISOString().split("T")[0] : "",
        amount: Number(raw.amount) || 0,
        paymentStatus: (raw.paymentStatus || "Successful") as 'Successful' | 'Pending' | 'Failed',
        paymentMethod: raw.paymentMethod || "UPI / Card",
        subscriptionStatus: computedStatus as 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Suspended',
        bookingsReceived: Number(raw.bookingsReceived) || 0,
        completedBookings: Number(raw.completedBookings) || 0,
        daysLeft: Math.max(0, daysLeft),
        transactionId: raw.transactionId || "",
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // 1. Check if DriverSubscription collection is empty; if so, auto-seed sample records
        const initialCount = await DriverSubscription.countDocuments();
        if (initialCount === 0) {
            try {
                // Find existing drivers and subscription plan if available
                const existingDrivers = await Driver.find().limit(5);
                const existingPlan = await Subscription.findOne();

                const planId = existingPlan?._id || new mongoose.Types.ObjectId();
                const planName = existingPlan?.planName || "Driver Monthly Pass";
                const amount = existingPlan?.price || 999;

                const defaultData = [
                    {
                        name: "Vikram Singh",
                        phone: "9876543210",
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                        status: "Active",
                        startOffsetDays: -15,
                        expiryOffsetDays: 15,
                        received: 62,
                        completed: 58,
                    },
                    {
                        name: "Suresh Kumar",
                        phone: "9876543211",
                        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
                        status: "Active",
                        startOffsetDays: -20,
                        expiryOffsetDays: 10,
                        received: 45,
                        completed: 42,
                    },
                    {
                        name: "Rajesh Naidu",
                        phone: "9876543212",
                        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
                        status: "Expiring Soon",
                        startOffsetDays: -28,
                        expiryOffsetDays: 2,
                        received: 88,
                        completed: 84,
                    },
                    {
                        name: "Manjunath Reddy",
                        phone: "9876543213",
                        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
                        status: "Expired",
                        startOffsetDays: -60,
                        expiryOffsetDays: -5,
                        received: 120,
                        completed: 112,
                    },
                ];

                const seedDocs = defaultData.map((d, idx) => {
                    const matchedDriver = existingDrivers[idx];
                    const driverId = matchedDriver?._id || new mongoose.Types.ObjectId();
                    const driverCustomId = matchedDriver?.driverId || `DRV-${101 + idx}`;
                    const driverName = matchedDriver ? `${matchedDriver.firstName} ${matchedDriver.lastName}`.trim() : d.name;
                    const driverPhone = matchedDriver?.phone || d.phone;
                    const driverAvatar = matchedDriver?.selfie || d.avatar;

                    const now = new Date();
                    const startDate = new Date(now.getTime() + d.startOffsetDays * 86400000);
                    const expiryDate = new Date(now.getTime() + d.expiryOffsetDays * 86400000);

                    return {
                        driverId,
                        driverCustomId,
                        driverName,
                        driverPhone,
                        driverAvatar,
                        planId,
                        planName,
                        amount,
                        durationDays: 30,
                        startDate,
                        expiryDate,
                        paymentStatus: "Successful",
                        paymentMethod: "UPI",
                        subscriptionStatus: d.status,
                        bookingsReceived: d.received,
                        completedBookings: d.completed,
                    };
                });

                await DriverSubscription.insertMany(seedDocs);
            } catch (seedErr) {
                console.warn("Could not auto-seed DriverSubscription records:", seedErr);
            }
        }

        const url = new URL(req.url);
        const search = (url.searchParams.get("search") || "").trim();
        const status = (url.searchParams.get("status") || "All").trim();

        // 2. Fetch all subscriptions to compute global summary stats accurately
        const allSubscriptions = await DriverSubscription.find().sort({ createdAt: -1 });

        const formattedAll = allSubscriptions.map(formatSubscriptionDoc);

        // Global stats calculation across all records
        const now = new Date();
        let totalPassRevenue = 0;
        let activePassRevenue = 0;
        let activePasses = 0;
        let expiringSoonPasses = 0;
        let expiredPasses = 0;

        formattedAll.forEach((sub) => {
            if (!sub) return;
            if (sub.subscriptionStatus === "Active") activePasses++;
            if (sub.subscriptionStatus === "Expiring Soon") expiringSoonPasses++;
            if (sub.subscriptionStatus === "Expired") expiredPasses++;

            if (sub.paymentStatus === "Successful") {
                totalPassRevenue += sub.amount || 0;
                if (sub.subscriptionStatus === "Active") {
                    activePassRevenue += sub.amount || 0;
                }
            }
        });

        const stats = {
            totalSubscriptions: formattedAll.length,
            totalPassRevenue,
            activePasses,
            activePassRevenue,
            expiringSoonPasses,
            expiredPasses,
        };

        // 3. Filter results based on search & status
        let filtered = formattedAll.filter((sub): sub is NonNullable<typeof sub> => sub !== null);

        if (status && status !== "All") {
            filtered = filtered.filter((sub) => sub.subscriptionStatus === status);
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(
                (sub) =>
                    sub.driverName.toLowerCase().includes(lowerSearch) ||
                    sub.driverPhone.toLowerCase().includes(lowerSearch) ||
                    sub.planName.toLowerCase().includes(lowerSearch) ||
                    sub.driverId.toLowerCase().includes(lowerSearch) ||
                    sub.transactionId.toLowerCase().includes(lowerSearch)
            );
        }

        // 4. Pagination
        const total = filtered.length;
        const pageParam = url.searchParams.get("page");
        const limitParam = url.searchParams.get("limit");
        const isAll = url.searchParams.get("all") === "true";

        const page = Math.max(1, parseInt(pageParam || "1", 10));
        let limit = 8;
        let totalPages = 1;
        let paginatedData = filtered;

        if (isAll) {
            limit = total > 0 ? total : 1;
            totalPages = 1;
            paginatedData = filtered;
        } else if (limitParam || pageParam) {
            limit = Math.max(1, parseInt(limitParam || "8", 10));
            totalPages = Math.ceil(total / limit) || 1;
            const skip = (page - 1) * limit;
            paginatedData = filtered.slice(skip, skip + limit);
        } else {
            // Default when neither page nor limit is explicitly specified
            limit = Math.max(1, parseInt(limitParam || "8", 10));
            totalPages = Math.ceil(total / limit) || 1;
            paginatedData = filtered.slice(0, limit);
        }

        const pagination = {
            total,
            page,
            limit,
            totalPages,
        };

        return NextResponse.json({
            success: true,
            count: paginatedData.length,
            stats,
            counts: {
                total: stats.totalSubscriptions,
                active: stats.activePasses,
                expiringSoon: stats.expiringSoonPasses,
                expired: stats.expiredPasses,
            },
            pagination,
            data: paginatedData,
        });
    } catch (error: any) {
        console.error("Error in GET /api/admin/driver-subscriptions:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch driver subscriptions" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const body = await req.json();
        const { id, subscriptionStatus, paymentStatus, expiryDate } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Subscription ID is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (expiryDate) updateData.expiryDate = new Date(expiryDate);

        // Find by _id or custom id
        let updated = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            updated = await DriverSubscription.findByIdAndUpdate(id, updateData, { new: true });
        }
        if (!updated) {
            updated = await DriverSubscription.findOneAndUpdate(
                { $or: [{ driverCustomId: id }, { transactionId: id }] },
                updateData,
                { new: true }
            );
        }

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Driver subscription not found" },
                { status: 404 }
            );
        }

        const formatted = formatSubscriptionDoc(updated);

        return NextResponse.json({
            success: true,
            message: "Subscription updated successfully",
            data: formatted,
        });
    } catch (error: any) {
        console.error("Error in PATCH /api/admin/driver-subscriptions:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update subscription" },
            { status: 500 }
        );
    }
}

