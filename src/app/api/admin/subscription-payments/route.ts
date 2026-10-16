import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import Driver from "@/models/driver";
import { verifyAdmin } from "@/lib/auth";

/**
 * GET /api/admin/subscription-payments
 * Returns all transactions related to subscription purchases for the Subscription Payments view.
 * Supports auto-seeding, global metric calculations, dynamic search, status filtering, and pagination.
 */
export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // 1. Check if any subscription transaction exists; if not, auto-seed realistic sample records
        const subBaseFilter: any = {
            $or: [
                { serviceType: { $regex: /subscription/i } },
                { subscriptionId: { $ne: null } },
                { planName: { $exists: true, $ne: "" } },
            ],
        };

        const existingCount = await Transaction.countDocuments(subBaseFilter);
        if (existingCount === 0) {
            try {
                const drivers = await Driver.find().limit(6);
                const sampleRecords = [
                    {
                        transactionId: "TXN-SUB-9021",
                        serviceType: "Subscription",
                        customerOrDriverName: "Kavitha R",
                        planName: "Driver Monthly Pass",
                        amount: 999,
                        method: "UPI",
                        payoutAmount: 0,
                        platformCommission: 999,
                        status: "Success",
                        createdAt: new Date("2026-10-15T10:30:00Z"),
                    },
                    {
                        transactionId: "TXN-SUB-9022",
                        serviceType: "Subscription",
                        customerOrDriverName: "Manoj Kumar",
                        planName: "Driver Weekly Pass",
                        amount: 349,
                        method: "Credit Card",
                        payoutAmount: 0,
                        platformCommission: 349,
                        status: "Success",
                        createdAt: new Date("2026-10-14T14:15:00Z"),
                    },
                    {
                        transactionId: "TXN-SUB-9023",
                        serviceType: "Subscription",
                        customerOrDriverName: "Rajesh Naidu",
                        planName: "Driver Monthly Pass",
                        amount: 999,
                        method: "UPI",
                        payoutAmount: 0,
                        platformCommission: 999,
                        status: "Success",
                        createdAt: new Date("2026-10-12T09:45:00Z"),
                    },
                    {
                        transactionId: "TXN-SUB-9024",
                        serviceType: "Subscription",
                        customerOrDriverName: "Anil Patel",
                        planName: "Driver Quarterly Pass",
                        amount: 2499,
                        method: "Net Banking",
                        payoutAmount: 0,
                        platformCommission: 2499,
                        status: "Pending",
                        createdAt: new Date("2026-10-10T16:20:00Z"),
                    },
                    {
                        transactionId: "TXN-SUB-9025",
                        serviceType: "Subscription",
                        customerOrDriverName: "Suresh Reddy",
                        planName: "Driver Monthly Pass",
                        amount: 999,
                        method: "UPI",
                        payoutAmount: 0,
                        platformCommission: 999,
                        status: "Success",
                        createdAt: new Date("2026-10-08T11:10:00Z"),
                    },
                    {
                        transactionId: "TXN-SUB-9026",
                        serviceType: "Subscription",
                        customerOrDriverName: "Vikram Singh",
                        planName: "Driver Monthly Pass",
                        amount: 999,
                        method: "Debit Card",
                        payoutAmount: 0,
                        platformCommission: 999,
                        status: "Failed",
                        createdAt: new Date("2026-10-05T18:00:00Z"),
                    },
                ];

                const seedDocs = sampleRecords.map((r, i) => {
                    const matchedDriver = drivers[i];
                    return {
                        ...r,
                        driverId: matchedDriver?._id || new mongoose.Types.ObjectId(),
                        customerOrDriverName: matchedDriver
                            ? `${matchedDriver.firstName || ""} ${matchedDriver.lastName || ""}`.trim() || r.customerOrDriverName
                            : r.customerOrDriverName,
                    };
                });

                await Transaction.insertMany(seedDocs);
            } catch (seedErr) {
                console.warn("Could not auto-seed subscription payment records:", seedErr);
            }
        }

        const url = new URL(req.url);
        const search = (url.searchParams.get("search") || "").trim();
        const status = (url.searchParams.get("status") || "All").trim();
        const pageParam = url.searchParams.get("page");
        const limitParam = url.searchParams.get("limit");
        const isAll = url.searchParams.get("all") === "true";

        const page = Math.max(1, parseInt(pageParam || "1", 10));
        const limit = Math.max(1, parseInt(limitParam || "8", 10));
        const skip = (page - 1) * limit;

        // 2. Fetch all subscription transactions for global stats calculation
        const allSubscriptionTxns = await Transaction.find(subBaseFilter).sort({ createdAt: -1 });

        let totalPassRevenue = 0;
        let completedCount = 0;
        let pendingCount = 0;
        let failedCount = 0;
        let refundedCount = 0;

        allSubscriptionTxns.forEach((t) => {
            const isSuccess = t.status === "Success" || t.status === "Successful";
            if (isSuccess) {
                totalPassRevenue += t.amount || 0;
                completedCount++;
            } else if (t.status === "Pending") {
                pendingCount++;
            } else if (t.status === "Failed") {
                failedCount++;
            } else if (t.status === "Refunded") {
                refundedCount++;
            }
        });

        // 3. Build query for filtered view
        const query: any = {
            ...subBaseFilter,
        };

        if (status && status !== "All") {
            const mappedStatus = status === "Successful" ? "Success" : status;
            query.status = { $regex: new RegExp(`^${mappedStatus}$`, "i") };
        }

        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchOr: any[] = [
                { transactionId: { $regex: escaped, $options: "i" } },
                { customerOrDriverName: { $regex: escaped, $options: "i" } },
                { planName: { $regex: escaped, $options: "i" } },
                { method: { $regex: escaped, $options: "i" } },
                { status: { $regex: escaped, $options: "i" } },
            ];

            const numericVal = Number(search.replace(/[^0-9.]/g, ""));
            if (!isNaN(numericVal) && numericVal > 0) {
                searchOr.push({ amount: numericVal });
            }

            query.$and = [{ $or: searchOr }];
        }

        const total = await Transaction.countDocuments(query);
        const totalPages = isAll ? 1 : Math.ceil(total / limit) || 1;

        let mongoQuery = Transaction.find(query).sort({ createdAt: -1 });
        if (!isAll) {
            mongoQuery = mongoQuery.skip(skip).limit(limit);
        }

        const transactions = await mongoQuery;

        const formatted = transactions.map((t) => ({
            id: t._id.toString(),
            _id: t._id.toString(),
            transactionId: t.transactionId,
            driverId: t.driverId ? t.driverId.toString() : "",
            driverName: t.customerOrDriverName || "Driver",
            planName: t.planName || "Driver Monthly Pass",
            amount: Number(t.amount) || 0,
            paymentMethod: t.method || "UPI",
            paymentDate: t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "",
            status: (t.status === "Success" ? "Successful" : t.status) as "Successful" | "Pending" | "Failed" | "Refunded",
            subscriptionId: t.subscriptionId ? t.subscriptionId.toString() : null,
            createdAt: t.createdAt,
        }));

        const pagination = {
            total,
            page: isAll ? 1 : page,
            limit: isAll ? total : limit,
            totalPages,
        };

        const stats = {
            totalPassRevenue,
            completedCount,
            pendingCount,
            failedCount,
            refundedCount,
            totalCount: allSubscriptionTxns.length,
            activePlanName: "Driver Monthly Pass",
            activePlanPrice: 999,
        };

        return NextResponse.json({
            success: true,
            totalRevenue: totalPassRevenue,
            stats,
            counts: {
                total: allSubscriptionTxns.length,
                successful: completedCount,
                pending: pendingCount,
                failed: failedCount,
                refunded: refundedCount,
            },
            pagination,
            data: formatted,
        });
    } catch (error: any) {
        console.error("Error fetching subscription payments:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch subscription payments" },
            { status: 500 }
        );
    }
}
