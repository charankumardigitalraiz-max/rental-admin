import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverSubscription from "@/models/driverSubscription";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const url = new URL(req.url);
        const search = url.searchParams.get("search") || "";
        const status = url.searchParams.get("status") || "All";

        const query: any = {};
        if (status && status !== "All") {
            query.subscriptionStatus = status;
        }
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.$or = [
                { driverName: { $regex: escaped, $options: "i" } },
                { driverPhone: { $regex: escaped, $options: "i" } },
                { planName: { $regex: escaped, $options: "i" } },
                { transactionId: { $regex: escaped, $options: "i" } },
            ];
        }

        const subscriptions = await DriverSubscription.find(query).sort({ createdAt: -1 });

        const formatted = subscriptions.map((s) => ({
            id: s._id.toString(),
            _id: s._id.toString(),
            driverId: s.driverCustomId || s.driverId?.toString(),
            driverName: s.driverName,
            driverAvatar: s.driverAvatar,
            driverPhone: s.driverPhone,
            planId: s.planId?.toString(),
            planName: s.planName,
            startDate: s.startDate ? new Date(s.startDate).toISOString().split("T")[0] : "",
            expiryDate: s.expiryDate ? new Date(s.expiryDate).toISOString().split("T")[0] : "",
            amount: s.amount,
            paymentStatus: s.paymentStatus,
            subscriptionStatus: s.subscriptionStatus,
            bookingsReceived: s.bookingsReceived || 0,
            completedBookings: s.completedBookings || 0,
            transactionId: s.transactionId,
            createdAt: s.createdAt,
        }));

        return NextResponse.json({
            success: true,
            count: formatted.length,
            data: formatted,
        });
    } catch (error: any) {
        console.error("Error in GET /api/admin/driver-subscriptions:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch driver subscriptions" },
            { status: 500 }
        );
    }
}
