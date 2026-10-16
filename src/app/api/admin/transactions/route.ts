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

        const url = new URL(req.url);
        const search = url.searchParams.get("search") || "";
        const serviceType = url.searchParams.get("serviceType") || "";
        const status = url.searchParams.get("status") || "";
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
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
            query.$or = [
                { transactionId: { $regex: escaped, $options: "i" } },
                { customerOrDriverName: { $regex: escaped, $options: "i" } },
                { planName: { $regex: escaped, $options: "i" } },
                { method: { $regex: escaped, $options: "i" } },
            ];
        }

        const [transactions, total] = await Promise.all([
            Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Transaction.countDocuments(query),
        ]);

        const formatted = transactions.map((t) => ({
            id: t._id.toString(),
            _id: t._id.toString(),
            transactionId: t.transactionId,
            bookingId: t.bookingId ? t.bookingId.toString() : null,
            subscriptionId: t.subscriptionId ? t.subscriptionId.toString() : null,
            customerId: t.customerId ? t.customerId.toString() : null,
            driverId: t.driverId ? t.driverId.toString() : null,
            serviceType: t.serviceType,
            customerOrDriverName: t.customerOrDriverName,
            planName: t.planName || "",
            amount: t.amount,
            method: t.method,
            paymentMethod: t.method,
            payoutAmount: t.payoutAmount,
            platformCommission: t.platformCommission,
            refundAmount: t.refundAmount,
            status: t.status,
            createdAt: t.createdAt,
            paymentDate: t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "",
        }));

        return NextResponse.json({
            success: true,
            total,
            page,
            limit,
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
