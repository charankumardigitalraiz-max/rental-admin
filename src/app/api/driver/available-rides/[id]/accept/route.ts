import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Driver from "@/models/driver";
import { verifyDriver } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * POST /api/driver/available-rides/[id]/accept
 * Allows an authenticated and verified driver to accept an available ride.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const driverPayload: any = verifyDriver(request);

    if (!driverPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing driver token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = await params;

    // Verify driver account validity and status
    const driver = await Driver.findById(driverPayload.id);
    if (!driver) {
      return NextResponse.json(
        { success: false, message: "Driver profile not found" },
        { status: 404 }
      );
    }

    if (!driver.isVerified || driver.status !== "verified") {
      return NextResponse.json(
        { success: false, message: "Your driver account is not verified or approved to accept rides" },
        { status: 403 }
      );
    }

    // Find the booking: must be pending or confirmed and unassigned
    const booking = await DriverBooking.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null },
        { bookingId: id },
      ],
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.driverId) {
      return NextResponse.json(
        { success: false, message: "This ride has already been accepted by another driver" },
        { status: 409 }
      );
    }

    if (booking.bookingStatus && ["cancelled", "trip_completed", "expired", "rejected"].includes(booking.bookingStatus)) {
      return NextResponse.json(
        { success: false, message: `Cannot accept booking with status: ${booking.bookingStatus}` },
        { status: 400 }
      );
    }

    // Assign driver and update status
    booking.driverId = driver._id;
    booking.bookingStatus = "driver_assigned";
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: "Ride accepted successfully",
        data: {
          bookingId: booking.bookingId,
          bookingStatus: booking.bookingStatus,
          scheduledStartTime: booking.scheduledStartTime,
          pickupLocation: booking.pickupLocation,
          dropLocation: booking.dropLocation,
          totalAmount: booking.totalAmount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Accept ride error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
