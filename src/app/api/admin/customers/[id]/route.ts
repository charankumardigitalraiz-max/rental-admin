import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/customer";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const { id } = await params;
        const customer = await Customer.findById(id);

        if (!customer) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: customer }, { status: 200 });
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

        // Prevent updating custId
        if (body.custId) {
            delete body.custId;
        }

        const { id } = await params;

        // Check if the new email is already in use by another customer
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
            }

            const existingCustomer = await Customer.findOne({ email: body.email, _id: { $ne: id } });
            if (existingCustomer) {
                return NextResponse.json({ success: false, error: "Email is already in use by another customer" }, { status: 400 });
            }
        }

        const customer = await Customer.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: customer }, { status: 200 });
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
        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Customer deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
