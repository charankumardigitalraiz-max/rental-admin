import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscription from "@/models/subscription";
import { formatSubscription } from "@/app/api/admin/subscription-plans/route";
import { verifyDriver } from "@/lib/auth";

/**
 * GET /api/driver/subscription-plans
 * Returns all active subscription plans available for drivers to purchase.
 * Requires driver JWT authentication.
 */
export async function GET(req: NextRequest) {
    try {
        const driver = verifyDriver(req);
        if (!driver) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Invalid or missing driver token" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Ensure default plans exist if collection is empty
        const count = await Subscription.countDocuments();
        if (count === 0) {
            try {
                await Subscription.create({
                    planName: "Driver Monthly Pass",
                    description: "Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.",
                    price: 999,
                    durationDays: 30,
                    billingCycle: "monthly",
                    localEligible: true,
                    outstationEligible: true,
                    maxRequestsPerDay: 999,
                    features: [
                        "Unlimited Local & Outstation Ride Dispatches",
                        "Instant Priority Dispatch Matching",
                        "Zero Commission Surcharge on Completed Trips",
                        "24/7 Driver Support & Helpline",
                    ],
                    status: true,
                });
            } catch (seedErr) {
                console.error("Auto-seed subscription plan error:", seedErr);
            }
        }

        // Fetch only active plans for drivers
        const plans = await Subscription.find({ status: true }).sort({ price: 1 });
        const formattedPlans = plans.map((p) => formatSubscription(p));

        return NextResponse.json(
            {
                success: true,
                count: formattedPlans.length,
                data: formattedPlans,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching driver subscription plans:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch subscription plans",
                error: error?.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}
