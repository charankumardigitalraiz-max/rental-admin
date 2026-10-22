import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscription from "@/models/subscription";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        await connectToDatabase();

        // Check if collection is empty; if so, seed default driver plan
        const initialCount = await Subscription.countDocuments();
        if (initialCount === 0) {
            try {
                await Subscription.create([
                    {
                        planName: "Driver Monthly Pass",
                        description: "Unlimited booking requests with 0% platform commission surcharge on completed rides.",
                        price: 999,
                        durationDays: 30,
                        billingCycle: "monthly",
                        localEligible: true,
                        outstationEligible: true,
                        maxRequestsPerDay: 999,
                        features: [
                            "Unlimited Local & Outstation Ride Dispatches",
                            "Instant Priority Dispatch Matching in high-demand zones",
                            "Zero Commission Surcharge on completed trips",
                            "Dedicated 24/7 Driver Support & Helpline",
                            "Digital Driver Badge Verification",
                        ],
                        status: true,
                    },
                    {
                        planName: "Driver Weekly Pass",
                        description: "Flexible 7-day driver pass with 0% commission for short-term and part-time drivers.",
                        price: 299,
                        durationDays: 7,
                        billingCycle: "weekly",
                        localEligible: true,
                        outstationEligible: true,
                        maxRequestsPerDay: 999,
                        features: [
                            "7-Day Unlimited Local & Outstation Dispatches",
                            "Zero Commission on all completed rides",
                            "Instant UPI Customer Direct Settlements",
                            "24/7 Driver Support & Emergency Assistance",
                        ],
                        status: true,
                    }
                ]);
            } catch (seedErr) {
                console.error("Auto-seed subscription plans error:", seedErr);
            }
        }

        // Fetch all active subscription plans ordered by price
        const docs = await Subscription.find({ status: true }).sort({ price: 1 }).lean();

        const formatted = docs.map((doc: any, index: number) => {
            const id = doc._id ? doc._id.toString() : doc.id;
            const durationDays = Number(doc.durationDays) || 30;
            const billingCycle = doc.billingCycle || (durationDays <= 7 ? 'weekly' : 'monthly');
            const period = billingCycle === 'monthly'
                ? 'per month'
                : billingCycle === 'weekly'
                    ? 'per week'
                    : `for ${durationDays} days`;

            const rawFeatures = Array.isArray(doc.features)
                ? doc.features
                : typeof doc.features === "string"
                    ? doc.features.split(",").map((f: string) => f.trim()).filter(Boolean)
                    : [];

            const fallbackFeatures = [
                "Unlimited Local & Outstation Ride Dispatches",
                "Instant Priority Dispatch Matching in high-demand zones",
                "Zero Commission Surcharge on completed trips",
                "Dedicated 24/7 Driver Support & Helpline",
                "Digital Driver Badge & Partner Verification",
            ];

            return {
                id,
                _id: id,
                name: doc.planName || doc.name || "Driver Pass",
                planName: doc.planName || doc.name || "Driver Pass",
                price: Number(doc.price) || 0,
                durationDays,
                billingCycle,
                period,
                description: doc.description || "Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.",
                popular: index === 0,
                localEligible: doc.localEligible !== false,
                outstationEligible: doc.outstationEligible !== false,
                commission: "0% Surcharge",
                features: rawFeatures.length > 0 ? rawFeatures : fallbackFeatures,
            };
        });

        return NextResponse.json(
            {
                success: true,
                count: formatted.length,
                data: formatted,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                },
            }
        );
    } catch (error: any) {
        console.error("Error fetching common subscription plans:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch subscription plans",
            },
            { status: 500 }
        );
    }
}
