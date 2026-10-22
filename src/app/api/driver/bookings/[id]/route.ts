import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Customer from "@/models/customer";
import { verifyDriver } from "@/lib/auth";
import { dispatchNotification } from "@/lib/notifications";
import mongoose from "mongoose";

/**
 * GET /api/driver/bookings/[id]
 * Fetch detailed information for a specific driver booking.
 * Can be fetched using either MongoDB _id or custom bookingId (e.g. BKG-123456).
 */
export async function GET(
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
    const driverObjectId = new mongoose.Types.ObjectId(driverPayload.id);

    // Build matching criteria:
    // Support MongoDB ObjectId OR string bookingId, must belong to the driver
    const matchCriteria: any = {
      driverId: driverObjectId,
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null },
        { bookingId: id },
      ],
    };

    const pipeline: any[] = [
      { $match: matchCriteria },
      {
        $lookup: {
          from: "customers",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                phone: 1,
                email: 1,
                custId: 1,
                address: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          userDetails: { $arrayElemAt: ["$userDetails", 0] },
          isKmBased: {
            $or: [
              { $gt: [{ $ifNull: ["$estimatedDistance", 0] }, 0] },
              { $gt: [{ $ifNull: ["$extraKmAmount", 0] }, 0] },
            ],
          },
          distanceKm: { $ifNull: ["$estimatedDistance", 0] },
        },
      },
    ];

    const bookings = await DriverBooking.aggregate(pipeline);

    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "Booking not found or not assigned to this driver" },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          booking,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching driver booking details:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/driver/bookings/[id]
 * Single API to handle trip milestones:
 * - action: "reached"  -> Driver arrived at pickup location (bookingStatus: "driver_arrived")
 * - action: "start"    -> Validates customer OTP then starts trip (bookingStatus: "trip_started", sets tripStartedAt)
 * - action: "end"      -> Completes trip (bookingStatus: "trip_completed", sets tripCompletedAt, actualDistance)
 */
export async function PATCH(
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
    const body = await request.json().catch(() => ({}));
    const { action, otp, startOtp, actualDistance } = body;

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

    // Find the booking belonging to this driver
    const booking = await DriverBooking.findOne({
      driverId: driverObjectId,
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null },
        { bookingId: id },
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
          message: "Status updated to reached / driver arrived",
          data: {
            bookingId: booking.bookingId,
            bookingStatus: booking.bookingStatus,
          },
        },
        { status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 2: START (Validate OTP and start the trip)
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
    console.error("Error in updating driver trip status:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
