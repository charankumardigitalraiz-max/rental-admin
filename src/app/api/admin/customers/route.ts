import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/customer";
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
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { custId: { $regex: search, $options: "i" } }
            ];
        }

        const status = url.searchParams.get("status");
        if (status !== null && status !== "") {
            query.status = status === 'true';
        }

        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const filteredTotal = await Customer.countDocuments(query);

        // Global counts for cards
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ status: true });
        const inactiveCustomers = await Customer.countDocuments({ status: false });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newCustomersThisMonth = await Customer.countDocuments({ createdAt: { $gte: startOfMonth } });

        return NextResponse.json({
            success: true,
            data: customers,
            counts: {
                total: totalCustomers,
                active: activeCustomers,
                inactive: inactiveCustomers,
                newThisMonth: newCustomersThisMonth
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
        const { firstName, lastName, email, phone, address, status } = body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
        }

        // Check if customer with this email already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return NextResponse.json({ success: false, error: "Customer with this email already exists" }, { status: 400 });
        }

        // Generate custId (e.g., CR20240001)
        const year = new Date().getFullYear();
        const prefix = `CR${year}`;

        const lastCustomer = await Customer.findOne({ custId: new RegExp(`^${prefix}`) })
            .sort({ custId: -1 })
            .select("custId");

        let sequence = 1;
        if (lastCustomer && lastCustomer.custId) {
            const lastSequenceStr = lastCustomer.custId.replace(prefix, "");
            const lastSequence = parseInt(lastSequenceStr, 10);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }

        const custId = `${prefix}${sequence.toString().padStart(4, "0")}`;

        // Create new customer
        const newCustomer = await Customer.create({
            firstName,
            lastName,
            custId,
            email,
            phone,
            address,
            status: status !== undefined ? status : true,
        });

        return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
