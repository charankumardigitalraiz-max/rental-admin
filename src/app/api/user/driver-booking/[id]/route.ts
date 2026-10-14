import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import { verifyUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload: any = verifyUser(request);

    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    // Fetch the booking by ID and make sure it belongs to the authenticated user
    const booking = await DriverBooking.findOne({ _id: id, userId: userPayload.id }).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { booking },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching driver booking:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
