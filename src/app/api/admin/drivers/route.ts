import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
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
                { driverId: { $regex: search, $options: "i" } }
            ];
        }

        const status = url.searchParams.get("status");
        if (status !== null && status !== "") {
            query.status = status === 'true';
        }

        const drivers = await Driver.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const filteredTotal = await Driver.countDocuments(query);

        // Global counts for cards
        const totalDrivers = await Driver.countDocuments();
        const activeDrivers = await Driver.countDocuments({ status: true });
        const inactiveDrivers = await Driver.countDocuments({ status: false });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newDriversThisMonth = await Driver.countDocuments({ createdAt: { $gte: startOfMonth } });

        return NextResponse.json({
            success: true,
            data: drivers,
            counts: {
                total: totalDrivers,
                active: activeDrivers,
                inactive: inactiveDrivers,
                newThisMonth: newDriversThisMonth
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
        const { firstName, lastName, email, phone, address, licenseNumber, status } = body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
        }

        // Check if driver with this email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return NextResponse.json({ success: false, error: "Driver with this email already exists" }, { status: 400 });
        }

        // Generate driverId (e.g., DR20240001)
        const year = new Date().getFullYear();
        const prefix = `DR${year}`;

        const lastDriver = await Driver.findOne({ driverId: new RegExp(`^${prefix}`) })
            .sort({ driverId: -1 })
            .select("driverId");

        let sequence = 1;
        if (lastDriver && lastDriver.driverId) {
            const lastSequenceStr = lastDriver.driverId.replace(prefix, "");
            const lastSequence = parseInt(lastSequenceStr, 10);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }

        const driverId = `${prefix}${sequence.toString().padStart(4, "0")}`;

        // Create new driver
        const newDriver = await Driver.create({
            firstName,
            lastName,
            driverId,
            email,
            phone,
            address,
            licenseNumber,
            status: status !== undefined ? status : true,
        });

        return NextResponse.json({ success: true, data: newDriver }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
