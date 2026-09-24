import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscription from "@/models/subscription";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const query: any = {};

        const search = url.searchParams.get("search");
        if (search) {
            query.$or = [
                { planName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const status = url.searchParams.get("status");
        if (status !== null && status !== "") {
            query.status = status === 'true';
        }

        const subscriptions = await Subscription.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const filteredTotal = await Subscription.countDocuments(query);

        // Global counts for cards
        const totalSubscriptions = await Subscription.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: true });
        const inactiveSubscriptions = await Subscription.countDocuments({ status: false });

        return NextResponse.json({
            success: true,
            data: subscriptions,
            counts: {
                total: totalSubscriptions,
                active: activeSubscriptions,
                inactive: inactiveSubscriptions
            },
            pagination: {
                total: filteredTotal,
                page,
                limit,
                totalPages: Math.ceil(filteredTotal / limit)
            }
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await req.json();
        const { planName, description, price, billingCycle, features, status } = body;

        // Check if plan with this name already exists
        const existingPlan = await Subscription.findOne({ planName: { $regex: new RegExp(`^${planName}$`, "i") } });
        if (existingPlan) {
            return NextResponse.json({ success: false, error: "Subscription plan with this name already exists" }, { status: 400 });
        }

        const newSubscription = await Subscription.create({
            planName,
            description,
            price,
            billingCycle: billingCycle || 'monthly',
            features: features || [],
            status: status !== undefined ? status : true,
        });

        return NextResponse.json({ success: true, data: newSubscription }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
