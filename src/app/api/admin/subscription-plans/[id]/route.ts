import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscription from "@/models/subscription";
import { verifyAdmin } from "@/lib/auth";
import { formatSubscription } from "../route";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const { id } = await params;
        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return NextResponse.json({ success: false, error: "Subscription plan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: formatSubscription(subscription) }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await req.json();
        const { id } = await params;

        // Check if plan name is being updated and conflicts with existing
        const targetPlanName = (body.planName || body.name || "").trim();
        if (targetPlanName) {
            const escaped = targetPlanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const existingPlan = await Subscription.findOne({ 
                planName: { $regex: new RegExp(`^${escaped}$`, "i") },
                _id: { $ne: id } 
            });
            if (existingPlan) {
                return NextResponse.json({ success: false, error: "Subscription plan with this name already exists" }, { status: 400 });
            }
        }

        const updateData: any = {};
        if (targetPlanName) updateData.planName = targetPlanName;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.price !== undefined) updateData.price = Number(body.price);
        if (body.durationDays !== undefined) updateData.durationDays = Number(body.durationDays);
        if (body.billingCycle !== undefined) updateData.billingCycle = body.billingCycle;
        if (body.localEligible !== undefined) updateData.localEligible = Boolean(body.localEligible);
        if (body.outstationEligible !== undefined) updateData.outstationEligible = Boolean(body.outstationEligible);
        if (body.maxRequestsPerDay !== undefined) updateData.maxRequestsPerDay = Number(body.maxRequestsPerDay);

        if (body.features !== undefined) {
            if (Array.isArray(body.features)) {
                updateData.features = body.features.map((f: any) => String(f).trim()).filter(Boolean);
            } else if (typeof body.features === "string") {
                updateData.features = body.features.split(",").map((f: string) => f.trim()).filter(Boolean);
            }
        }

        if (body.status !== undefined) {
            updateData.status = body.status === true || body.status === "Active" || body.status === "active";
        }

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!subscription) {
            return NextResponse.json({ success: false, error: "Subscription plan not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: formatSubscription(subscription),
            message: "Subscription plan updated successfully"
        }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating subscription plan:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const { id } = await params;
        const subscription = await Subscription.findByIdAndDelete(id);

        if (!subscription) {
            return NextResponse.json({ success: false, error: "Subscription plan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Subscription plan deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
