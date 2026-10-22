import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Customer from "@/models/customer";
import { verifyDriver } from "@/lib/auth";
import { dispatchNotification } from "@/lib/notifications";
import mongoose from "mongoose";

/**
 * POST or PATCH /api/driver/bookings/trip-status
 * 
 * Request body:
 * {
 *   "bookingId": "BKG-123456" or Mongo ObjectId (required),
 *   "action": "reached" | "start" | "end" (required),
 *   "otp": "1234" (required when action is "start"),
 *   "actualDistance": 25.5 (optional when action is "end")
 * }
 * 
 * Handles:
 * - action: "reached" -> Updates status to "driver_arrived"
 * - action: "start"   -> Validates OTP, then updates status to "trip_started" & sets tripStartedAt
 * - action: "end"     -> Updates status to "trip_completed" & sets tripCompletedAt & actualDistance
 */
async function handleTripStatusUpdate(request: Request) {
  try {
    const driverPayload: any = verifyDriver(request);

    if (!driverPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing driver token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json().catch(() => ({}));
    const { bookingId, id, action, otp, startOtp, actualDistance } = body;

    const targetBookingIdentifier = bookingId || id;
    if (!targetBookingIdentifier) {
      return NextResponse.json(
        {
          success: false,
          message: "bookingId is required",
        },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          message: "Action is required. Allowed values: 'reached', 'start', 'end'",
        },
        { status: 400 }
      );
    }

    const normalizedAction = action.toString().toLowerCase().trim();
    const driverObjectId = new mongoose.Types.ObjectId(driverPayload.id);

    // Find the booking assigned to this driver
    const booking = await DriverBooking.findOne({
      driverId: driverObjectId,
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(targetBookingIdentifier) ? new mongoose.Types.ObjectId(targetBookingIdentifier) : null },
        { bookingId: targetBookingIdentifier },
      ],
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found or not assigned to this driver" },
        { status: 404 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 1: REACHED (Driver arrived at pickup location)
    // ─────────────────────────────────────────────────────────────
    if (normalizedAction === "reached" || normalizedAction === "arrived") {
      if (booking.bookingStatus === "trip_completed") {
        return NextResponse.json(
          { success: false, message: "Trip is already completed" },
          { status: 400 }
        );
      }
      if (booking.bookingStatus === "trip_started") {
        return NextResponse.json(
          { success: false, message: "Trip has already started" },
          { status: 400 }
        );
      }

      booking.bookingStatus = "driver_arrived";
      await booking.save();

      // Notify customer that driver has arrived
      try {
        const customer = await Customer.findById(booking.userId).select("fcmToken firstName");
        await dispatchNotification({
          title: "Driver Has Arrived! 🚗",
          message: `Your driver has arrived at the pickup location. Share OTP ${booking.startOtp || ""} to start the ride.`,
          targetAudience: "Customers",
          token: customer?.fcmToken || undefined,
          type: "Booking",
          data: {
            bookingId: booking.bookingId,
            status: "driver_arrived",
            startOtp: booking.startOtp || "",
          },
        });
      } catch (notifErr: any) {
        console.warn("Could not dispatch push notification for reached:", notifErr?.message);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Status updated to reached (driver arrived)",
          data: {
            bookingId: booking.bookingId,
            bookingStatus: booking.bookingStatus,
          },
        },
        { status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 2: START (Validate OTP then start trip)
    // ─────────────────────────────────────────────────────────────
    if (normalizedAction === "start" || normalizedAction === "start_trip") {
      if (booking.bookingStatus === "trip_completed") {
        return NextResponse.json(
          { success: false, message: "Trip is already completed" },
          { status: 400 }
        );
      }
      if (booking.bookingStatus === "trip_started") {
        return NextResponse.json(
          { success: false, message: "Trip has already been started" },
          { status: 400 }
        );
      }

      const inputOtp = (otp || startOtp || "").toString().trim();
      if (!inputOtp) {
        return NextResponse.json(
          {
            success: false,
            message: "Start OTP is required to start the ride",
          },
          { status: 400 }
        );
      }

      const expectedOtp = (booking.startOtp || "").toString().trim();
      if (!expectedOtp || inputOtp !== expectedOtp) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid OTP. Please ask the customer for the correct start OTP.",
          },
          { status: 400 }
        );
      }

      booking.bookingStatus = "trip_started";
      booking.tripStartedAt = new Date();
      await booking.save();

      // Notify customer that trip has started
      try {
        const customer = await Customer.findById(booking.userId).select("fcmToken firstName");
        await dispatchNotification({
          title: "Trip Started! 🟢",
          message: `Your ride ${booking.bookingId} has started. Have a safe journey!`,
          targetAudience: "Customers",
          token: customer?.fcmToken || undefined,
          type: "Booking",
          data: {
            bookingId: booking.bookingId,
            status: "trip_started",
            tripStartedAt: booking.tripStartedAt.toISOString(),
          },
        });
      } catch (notifErr: any) {
        console.warn("Could not dispatch push notification for start trip:", notifErr?.message);
      }

      return NextResponse.json(
        {
          success: true,
          message: "OTP validated successfully. Trip started!",
          data: {
            bookingId: booking.bookingId,
            bookingStatus: booking.bookingStatus,
            tripStartedAt: booking.tripStartedAt,
          },
        },
        { status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 3: END (Complete the trip)
    // ─────────────────────────────────────────────────────────────
    if (normalizedAction === "end" || normalizedAction === "complete" || normalizedAction === "end_trip") {
      if (booking.bookingStatus === "trip_completed") {
        return NextResponse.json(
          { success: false, message: "Trip is already marked as completed" },
          { status: 400 }
        );
      }

      booking.bookingStatus = "trip_completed";
      booking.tripCompletedAt = new Date();

      if (actualDistance !== undefined && actualDistance !== null) {
        booking.actualDistance = Number(actualDistance) || 0;
      }

      await booking.save();

      // Notify customer that trip has completed
      try {
        const customer = await Customer.findById(booking.userId).select("fcmToken firstName");
        await dispatchNotification({
          title: "Trip Completed! 🏁",
          message: `Your ride ${booking.bookingId} has been successfully completed. Thank you for riding with us!`,
          targetAudience: "Customers",
          token: customer?.fcmToken || undefined,
          type: "Booking",
          data: {
            bookingId: booking.bookingId,
            status: "trip_completed",
            tripCompletedAt: booking.tripCompletedAt.toISOString(),
            totalAmount: String(booking.totalAmount || 0),
          },
        });
      } catch (notifErr: any) {
        console.warn("Could not dispatch push notification for end trip:", notifErr?.message);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Trip completed successfully!",
          data: {
            bookingId: booking.bookingId,
            bookingStatus: booking.bookingStatus,
            tripStartedAt: booking.tripStartedAt,
            tripCompletedAt: booking.tripCompletedAt,
            actualDistance: booking.actualDistance,
            totalAmount: booking.totalAmount,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `Invalid action '${action}'. Allowed actions: 'reached', 'start', 'end'`,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in trip-status API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handleTripStatusUpdate(request);
}

export async function PATCH(request: Request) {
  return handleTripStatusUpdate(request);
}
