import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscription from "@/models/subscription";
import { verifyAdmin } from "@/lib/auth";

export function formatSubscription(doc: any) {
    const raw = doc && typeof doc.toObject === "function" ? doc.toObject() : doc;
    if (!raw) return null;
    const id = raw._id ? raw._id.toString() : raw.id;
    const planName = raw.planName || raw.name || "Driver Pass";
    const statusStr = typeof raw.status === "boolean" ? (raw.status ? "Active" : "Inactive") : (raw.status || "Active");

    return {
        id,
        _id: id,
        name: planName,
        planName,
        description: raw.description || "Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.",
        price: Number(raw.price) || 0,
        durationDays: Number(raw.durationDays) || 30,
        billingCycle: raw.billingCycle || "monthly",
        localEligible: raw.localEligible !== undefined ? Boolean(raw.localEligible) : true,
        outstationEligible: raw.outstationEligible !== undefined ? Boolean(raw.outstationEligible) : true,
        maxRequestsPerDay: Number(raw.maxRequestsPerDay) || 999,
        features: Array.isArray(raw.features)
            ? raw.features
            : typeof raw.features === "string"
                ? raw.features.split(",").map((f: string) => f.trim()).filter(Boolean)
                : [],
        status: statusStr as "Active" | "Inactive",
        isActive: statusStr === "Active",
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        // Check if collection is empty; if so, seed default driver plan
        const initialCount = await Subscription.countDocuments();
        if (initialCount === 0) {
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

        const url = new URL(req.url);
        const isAll = url.searchParams.get("all") === "true";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limitParam = url.searchParams.get("limit");
        const limit = isAll ? 0 : parseInt(limitParam || "50");
        const skip = isAll ? 0 : (page - 1) * limit;

        const query: any = {};

        const search = url.searchParams.get("search");
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.$or = [
                { planName: { $regex: escaped, $options: "i" } },
                { description: { $regex: escaped, $options: "i" } }
            ];
        }

        const statusParam = url.searchParams.get("status");
        if (statusParam && statusParam.toLowerCase() !== "all") {
            if (statusParam === "true" || statusParam.toLowerCase() === "active") {
                query.status = true;
            } else if (statusParam === "false" || statusParam.toLowerCase() === "inactive") {
                query.status = false;
            }
        }

        let mongoQuery = Subscription.find(query).sort({ createdAt: -1 });
        if (!isAll && limit > 0) {
            mongoQuery = mongoQuery.skip(skip).limit(limit);
        }

        const subscriptions = await mongoQuery;
        const filteredTotal = await Subscription.countDocuments(query);

        // Global counts for metrics
        const totalSubscriptions = await Subscription.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: true });
        const inactiveSubscriptions = await Subscription.countDocuments({ status: false });

        const formatted = subscriptions.map((s) => formatSubscription(s));

        return NextResponse.json({
            success: true,
            data: formatted,
            counts: {
                total: totalSubscriptions,
                active: activeSubscriptions,
                inactive: inactiveSubscriptions
            },
            pagination: {
                total: filteredTotal,
                page,
                limit: isAll ? filteredTotal : limit,
                totalPages: isAll || limit === 0 ? 1 : Math.ceil(filteredTotal / limit)
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error("Error in GET /api/admin/subscription-plans:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await req.json();

        const planName = (body.planName || body.name || "").trim();
        if (!planName) {
            return NextResponse.json({ success: false, error: "Subscription plan name is required" }, { status: 400 });
        }

        const price = Number(body.price);
        if (isNaN(price) || price < 0) {
            return NextResponse.json({ success: false, error: "A valid positive price is required" }, { status: 400 });
        }

        // Check if plan with this name already exists
        const escaped = planName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const existingPlan = await Subscription.findOne({ planName: { $regex: new RegExp(`^${escaped}$`, "i") } });
        if (existingPlan) {
            return NextResponse.json({ success: false, error: "Subscription plan with this name already exists" }, { status: 400 });
        }

        let parsedFeatures: string[] = [];
        if (Array.isArray(body.features)) {
            parsedFeatures = body.features.map((f: any) => String(f).trim()).filter(Boolean);
        } else if (typeof body.features === "string") {
            parsedFeatures = body.features.split(",").map((f: string) => f.trim()).filter(Boolean);
        }

        const isStatusActive = body.status === undefined || body.status === true || body.status === "Active" || body.status === "active";
        const durationDays = Number(body.durationDays) || 30;

        const newSubscription = await Subscription.create({
            planName,
            description: body.description?.trim() || "Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.",
            price,
            durationDays,
            billingCycle: body.billingCycle || (durationDays === 365 ? 'yearly' : durationDays === 7 ? 'weekly' : 'monthly'),
            localEligible: body.localEligible !== undefined ? Boolean(body.localEligible) : true,
            outstationEligible: body.outstationEligible !== undefined ? Boolean(body.outstationEligible) : false,
            maxRequestsPerDay: Number(body.maxRequestsPerDay) || 10,
            features: parsedFeatures.length > 0 ? parsedFeatures : [
                "Local city driver bookings",
                "Standard dispatch priority",
                "24/7 Helpline"
            ],
            status: isStatusActive,
        });

        return NextResponse.json({
            success: true,
            data: formatSubscription(newSubscription),
            message: "Subscription plan created successfully"
        }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/admin/subscription-plans:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
