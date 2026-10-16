import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import { verifyAdmin } from "@/lib/auth";

/**
 * GET /api/admin/subscription-payments
 * Returns all transactions related to subscription purchases for the Subscription Payments view.
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
        const status = url.searchParams.get("status") || "";

        const query: any = {
            $or: [
                { serviceType: "Driver Subscription" },
                { subscriptionId: { $ne: null } },
            ],
        };

        if (status && status !== "All") {
            const mappedStatus = status === "Successful" ? "Success" : status;
            query.status = { $regex: new RegExp(`^${mappedStatus}$`, "i") };
        }

        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.$and = [
                {
                    $or: [
                        { transactionId: { $regex: escaped, $options: "i" } },
                        { customerOrDriverName: { $regex: escaped, $options: "i" } },
                        { planName: { $regex: escaped, $options: "i" } },
                    ],
                },
            ];
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 });

        const formatted = transactions.map((t) => ({
            id: t._id.toString(),
            _id: t._id.toString(),
            transactionId: t.transactionId,
            driverId: t.driverId ? t.driverId.toString() : "",
            driverName: t.customerOrDriverName || "Driver",
            planName: t.planName || "Driver Monthly Pass",
            amount: t.amount,
            paymentMethod: t.method || "UPI",
            paymentDate: t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "",
            status: t.status === "Success" ? "Successful" : t.status,
            subscriptionId: t.subscriptionId ? t.subscriptionId.toString() : null,
            createdAt: t.createdAt,
        }));

        const totalRevenue = formatted
            .filter((sp) => sp.status === "Successful")
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        return NextResponse.json({
            success: true,
            totalRevenue,
            count: formatted.length,
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
