import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverPricing from "@/models/driverPricing";

// GET all driver pricing
export async function GET() {
    try {
        await connectToDatabase();
        const driverPricing = await DriverPricing.find().lean();
        
        return NextResponse.json(
            { success: true, data: driverPricing },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
