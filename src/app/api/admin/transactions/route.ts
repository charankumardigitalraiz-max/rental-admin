import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import { verifyAdmin } from "@/lib/auth";

/**
 * GET /api/admin/transactions
 * Fetch all transactions with filters, search, and pagination.
 */
export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // 1. Check if Transaction collection is empty; if so, auto-seed default transactions
        const initialCount = await Transaction.countDocuments();
        if (initialCount === 0) {
            try {
                const seedDocs = [
                    {
                        transactionId: "TXN-DRV-8801",
                        serviceType: "Driver Local",
                        customerOrDriverName: "Aarav Sharma",
                        amount: 1298,
                        method: "Razorpay UPI",
                        payoutAmount: 1020,
                        platformCommission: 278,
                        refundAmount: 0,
                        status: "Success",
                        createdAt: new Date("2026-09-15T14:10:00Z"),
                    },
                    {
                        transactionId: "TXN-VLT-5502",
                        serviceType: "Valet Staff",
                        customerOrDriverName: "Titan Corporate",
                        amount: 5900,
                        method: "NetBanking",
                        payoutAmount: 4200,
                        platformCommission: 1700,
                        refundAmount: 0,
                        status: "Success",
                        createdAt: new Date("2026-09-15T10:00:00Z"),
                    },
                    {
                        transactionId: "TXN-SUB-9901",
                        serviceType: "Subscription",
                        customerOrDriverName: "Vikram Singh",
                        planName: "Driver Monthly Pass",
                        amount: 2499,
                        method: "UPI",
                        payoutAmount: 0,
                        platformCommission: 2499,
                        refundAmount: 0,
                        status: "Success",
                        createdAt: new Date("2026-09-01T10:30:00Z"),
                    },
                    {
                        transactionId: "TXN-DRV-8802",
                        serviceType: "Driver Outstation",
                        customerOrDriverName: "Priya Nair",
                        amount: 3450,
                        method: "Credit Card",
                        payoutAmount: 2760,
                        platformCommission: 690,
                        refundAmount: 0,
                        status: "Pending",
                        createdAt: new Date("2026-09-16T11:45:00Z"),
                    },
                    {
                        transactionId: "TXN-VLT-5503",
                        serviceType: "Valet Staff",
                        customerOrDriverName: "Infosys Campus",
                        amount: 8500,
                        method: "UPI",
                        payoutAmount: 6800,
                        platformCommission: 1700,
                        refundAmount: 0,
                        status: "Success",
                        createdAt: new Date("2026-09-18T16:20:00Z"),
                    },
                ];
                await Transaction.insertMany(seedDocs);
            } catch (seedErr) {
                console.warn("Could not auto-seed Transaction records:", seedErr);
            }
        }

        const url = new URL(req.url);
        const search = (url.searchParams.get("search") || "").trim();
        const serviceType = (url.searchParams.get("serviceType") || "").trim();
        const status = (url.searchParams.get("status") || "").trim();
        const pageParam = url.searchParams.get("page");
        const limitParam = url.searchParams.get("limit");
        const isAll = url.searchParams.get("all") === "true";

        const page = Math.max(1, parseInt(pageParam || "1", 10));
        const limit = Math.max(1, parseInt(limitParam || "8", 10));
        const skip = (page - 1) * limit;

        const query: any = {};

        if (serviceType && serviceType !== "All") {
            query.serviceType = { $regex: new RegExp(serviceType, "i") };
        }

        if (status && status !== "All") {
            query.status = { $regex: new RegExp(`^${status}$`, "i") };
        }

        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchOr: any[] = [
                { transactionId: { $regex: escaped, $options: "i" } },
                { customerOrDriverName: { $regex: escaped, $options: "i" } },
                { planName: { $regex: escaped, $options: "i" } },
                { method: { $regex: escaped, $options: "i" } },
                { serviceType: { $regex: escaped, $options: "i" } },
                { status: { $regex: escaped, $options: "i" } },
            ];

            const numericVal = Number(search.replace(/[^0-9.]/g, ""));
            if (!isNaN(numericVal) && numericVal > 0) {
                searchOr.push({ amount: numericVal });
                searchOr.push({ payoutAmount: numericVal });
                searchOr.push({ platformCommission: numericVal });
            }

            query.$or = searchOr;
        }

        // Global stats calculation across all records
        const allTransactions = await Transaction.find({});
        let totalRevenue = 0;
        let totalCommission = 0;
        let totalPayout = 0;
        let successCount = 0;
        let pendingCount = 0;
        let failedCount = 0;
        let refundedCount = 0;

        allTransactions.forEach((t) => {
            if (t.status === "Success") {
                totalRevenue += t.amount || 0;
                totalCommission += t.platformCommission || 0;
                totalPayout += t.payoutAmount || 0;
                successCount++;
            } else if (t.status === "Pending") {
                pendingCount++;
            } else if (t.status === "Failed") {
                failedCount++;
            } else if (t.status === "Refunded") {
                refundedCount++;
            }
        });

        const stats = {
            totalRevenue,
            totalCommission,
            totalPayout,
            totalCount: allTransactions.length,
            successCount,
            pendingCount,
            failedCount,
            refundedCount,
            successRate:
                allTransactions.length > 0
                    ? Math.round((successCount / allTransactions.length) * 100)
                    : 100,
        };

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
            bookingId: t.bookingId ? t.bookingId.toString() : (t.transactionId || ""),
            subscriptionId: t.subscriptionId ? t.subscriptionId.toString() : "",
            customerId: t.customerId ? t.customerId.toString() : "",
            driverId: t.driverId ? t.driverId.toString() : "",
            serviceType: t.serviceType || "Driver Local",
            customerOrDriverName: t.customerOrDriverName || "Customer",
            planName: t.planName || "",
            amount: Number(t.amount) || 0,
            method: t.method || "UPI",
            paymentMethod: t.method || "UPI",
            payoutAmount: Number(t.payoutAmount) || 0,
            platformCommission: Number(t.platformCommission) || 0,
            refundAmount: Number(t.refundAmount) || 0,
            status: t.status || "Pending",
            date: t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "",
            paymentDate: t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "",
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));

        const pagination = {
            total,
            page: isAll ? 1 : page,
            limit: isAll ? total : limit,
            totalPages,
        };

        return NextResponse.json({
            success: true,
            count: formatted.length,
            total,
            page: pagination.page,
            limit: pagination.limit,
            stats,
            counts: {
                total: stats.totalCount,
                success: stats.successCount,
                pending: stats.pendingCount,
                failed: stats.failedCount,
                refunded: stats.refundedCount,
            },
            pagination,
            data: formatted,
        });
    } catch (error: any) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/transactions
 * Create a transaction record manually (e.g. payouts, manual adjustments).
 */
export async function POST(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const body = await req.json();

        const newTxn = await Transaction.create(body);

        return NextResponse.json(
            {
                success: true,
                message: "Transaction created successfully",
                data: newTxn,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
