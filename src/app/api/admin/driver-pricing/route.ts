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
    const pricingList = await DriverPricing.find({}).sort({ createdAt: -1 });

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

    // Upsert: Find any existing pricing configuration and update it, 
    // or create a new one if it doesn't exist.
    // If you plan to have multiple pricing configs in the future, change the `{}` to a specific filter.
    const filter = body._id ? { _id: body._id } : {};
    
    const updatedPricing = await DriverPricing.findOneAndUpdate(
      filter,
      body,
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
