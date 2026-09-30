import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const { id } = await params;
        const driver = await Driver.findById(id);

        if (!driver) {
            return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: driver }, { status: 200 });
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

        // Prevent updating driverId
        if (body.driverId) {
            delete body.driverId;
        }

        const { id } = await params;

        // Check if the new email is already in use by another driver
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
            }

            const existingDriver = await Driver.findOne({ email: body.email, _id: { $ne: id } });
            if (existingDriver) {
                return NextResponse.json({ success: false, error: "Email is already in use by another driver" }, { status: 400 });
            }
        }

        const driver = await Driver.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!driver) {
            return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: driver }, { status: 200 });
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
        const driver = await Driver.findByIdAndDelete(id);

        if (!driver) {
            return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Driver deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
