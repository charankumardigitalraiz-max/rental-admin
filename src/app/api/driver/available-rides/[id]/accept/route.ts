import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Driver from "@/models/driver";
import Customer from "@/models/customer";
import { verifyDriver } from "@/lib/auth";
import { emitRideTaken, emitBookingUpdate } from "@/lib/socket";
import { dispatchNotification } from "@/lib/notifications";
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

    // Check driver verification status
    const isApproved =
      driver.isVerified === true ||
      ["verified", "approved", "active"].includes(driver.status);
    if (!isApproved) {
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

    // Atomically assign driver and set status to driver_assigned
    const updatedBooking = await DriverBooking.findOneAndUpdate(
      {
        _id: booking._id,
        $or: [{ driverId: null }, { driverId: { $exists: false } }],
      },
      {
        $set: {
          driverId: driver._id,
          bookingStatus: "driver_assigned",
        },
      },
      {
        new: true,
      }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, message: "Ride was just accepted by another driver" },
        { status: 409 }
      );
    }

    // ⚡ 1. Tell all other drivers to remove this ride from available list
    emitRideTaken(updatedBooking.bookingId, updatedBooking._id.toString());

    // ⚡ 2. Notify the customer and driver listening in the booking room
    emitBookingUpdate(updatedBooking.bookingId, "ride:new_available", {
      bookingId: updatedBooking.bookingId,
      bookingStatus: "driver_assigned",
      driver: {
        id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        driverId: driver.driverId,
      },
    });

    // 🔔 3. Send FCM Push Notification to Customer
    try {
      const customer = await Customer.findById(updatedBooking.userId);
      const driverFullName = `${driver.firstName || ""} ${driver.lastName || ""}`.trim() || "A driver";

      await dispatchNotification({
        title: "Driver Assigned! 🚗",
        message: `${driverFullName} has accepted your ride request (${updatedBooking.bookingId}).`,
        targetAudience: "Customers",
        token: customer?.fcmToken || undefined,
        type: "Assignment",
        data: {
          bookingId: updatedBooking.bookingId,
          bookingStatus: "driver_assigned",
          driverId: driver._id.toString(),
          driverName: driverFullName,
          driverPhone: driver.phone || "",
        },
      });

      // 🔔 4. Send Push Notification to Admin (topic: 'admin')
      await dispatchNotification({
        title: "Ride Accepted 🚗",
        message: `Driver ${driverFullName} accepted booking ${updatedBooking.bookingId}.`,
        targetAudience: "All",
        topic: "admin",
        type: "Assignment",
        data: {
          bookingId: updatedBooking.bookingId,
          driverId: driver._id.toString(),
          driverName: driverFullName,
        },
      });
    } catch (notifErr: any) {
      console.warn("Could not dispatch push notification on accept:", notifErr?.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ride accepted successfully",
        data: {
          bookingId: updatedBooking.bookingId,
          bookingStatus: updatedBooking.bookingStatus,
          driverId: updatedBooking.driverId,
          scheduledStartTime: updatedBooking.scheduledStartTime,
          pickupLocation: updatedBooking.pickupLocation,
          dropLocation: updatedBooking.dropLocation,
          totalAmount: updatedBooking.totalAmount,
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
