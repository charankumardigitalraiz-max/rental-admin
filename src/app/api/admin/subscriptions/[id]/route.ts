import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscription from "@/models/subscription";
import { verifyAdmin } from "@/lib/auth";

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

        return NextResponse.json({ success: true, data: subscription }, { status: 200 });
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
        if (body.planName) {
            const existingPlan = await Subscription.findOne({ 
                planName: { $regex: new RegExp(`^${body.planName}$`, "i") },
                _id: { $ne: id } 
            });
            if (existingPlan) {
                return NextResponse.json({ success: false, error: "Subscription plan with this name already exists" }, { status: 400 });
            }
        }

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!subscription) {
            return NextResponse.json({ success: false, error: "Subscription plan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: subscription }, { status: 200 });
    } catch (error: any) {
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
