import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import { verifyDriver } from "@/lib/auth";

/**
 * GET /api/driver/transactions
 * Fetch all transaction records belonging to the authenticated driver (trips, subscription passes, earnings).
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

        const url = new URL(req.url);
        const serviceType = url.searchParams.get("serviceType") || "";
        const status = url.searchParams.get("status") || "";

        const query: any = { driverId: driverObjectId };

        if (serviceType && serviceType !== "All") {
            query.serviceType = { $regex: new RegExp(serviceType, "i") };
        }

        if (status && status !== "All") {
            query.status = { $regex: new RegExp(`^${status}$`, "i") };
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 });

        const formatted = transactions.map((t) => ({
            id: t._id.toString(),
            _id: t._id.toString(),
            transactionId: t.transactionId,
            serviceType: t.serviceType,
            planName: t.planName || "",
            amount: t.amount,
            method: t.method,
            status: t.status,
            createdAt: t.createdAt,
            date: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "",
        }));

        return NextResponse.json({
            success: true,
            count: formatted.length,
            data: formatted,
        });
    } catch (error: any) {
        console.error("Error fetching driver transactions:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch driver transactions",
                error: error?.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}
