import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverPricing from "@/models/driverPricing";
import { verifyAdmin } from "@/lib/auth";

// GET all driver pricing configurations
export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    let pricingList = await DriverPricing.find({}).sort({ createdAt: -1 });

    if (!pricingList || pricingList.length === 0) {
      const defaultDoc = await DriverPricing.create({
        local: {
          one_way: {
            morningHours: { hours: 4, timeRange: "06:00-18:00", customerPrice: 400, driverPrice: 320 },
            nightHours: { hours: 4, timeRange: "18:00-06:00", customerPrice: 500, driverPrice: 400 },
          },
          round_trip: {
            morningHours: { hours: 8, timeRange: "06:00-18:00", customerPrice: 800, driverPrice: 650 },
            nightHours: { hours: 8, timeRange: "18:00-06:00", customerPrice: 950, driverPrice: 780 },
          },
        },
        outstation: {
          one_way: {
            day: 1,
            customerPrice: 1500,
            driverPrice: 1200,
            morningHours: { hours: 12, timeRange: "06:00-18:00", customerPrice: 1500, driverPrice: 1200 },
            nightHours: { hours: 12, timeRange: "18:00-06:00", customerPrice: 1800, driverPrice: 1450 },
          },
          round_trip: {
            day: 1,
            customerPrice: 2000,
            driverPrice: 1600,
            morningHours: { hours: 12, timeRange: "06:00-18:00", customerPrice: 2000, driverPrice: 1600 },
            nightHours: { hours: 12, timeRange: "18:00-06:00", customerPrice: 2400, driverPrice: 1950 },
          },
        },
      });
      pricingList = [defaultDoc];
    }

    return NextResponse.json({ success: true, data: pricingList }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching driver pricing:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE or UPDATE a driver pricing configuration
export async function POST(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectToDatabase();

    const { _id, ...updatePayload } = body;
    const filter = _id ? { _id } : {};
    
    const updatedPricing = await DriverPricing.findOneAndUpdate(
      filter,
      updatePayload,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Driver pricing saved successfully",
        data: updatedPricing,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving driver pricing:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
