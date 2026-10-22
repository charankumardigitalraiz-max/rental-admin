import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Driver from "@/models/driver";
import Customer from "@/models/customer";
import { verifyDriver } from "@/lib/auth";
import { emitBookingUpdate } from "@/lib/socket";
import { dispatchNotification } from "@/lib/notifications";
import mongoose from "mongoose";

/**
 * POST /api/driver/available-rides/[id]/reject
 * Allows an authenticated driver to reject/decline an available ride.
 * The booking remains available for other eligible drivers, but is hidden from this driver's available list.
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
    const body = await request.json().catch(() => ({}));
    const { reason = "Driver declined the ride" } = body;

    // Verify driver existence
    const driver = await Driver.findById(driverPayload.id);
    if (!driver) {
      return NextResponse.json(
        { success: false, message: "Driver profile not found" },
        { status: 404 }
      );
    }

    // Find the booking
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

    // Check if ride was already accepted by someone else
    if (booking.driverId && booking.driverId.toString() !== driver._id.toString()) {
      return NextResponse.json(
        { success: false, message: "This ride is already assigned to another driver" },
        { status: 400 }
      );
    }

    const driverObjectId = new mongoose.Types.ObjectId(driver._id);
    const rejectTime = new Date();

    const rejectEntry = {
      driverId: driverObjectId,
      reason,
      rejectTime,
    };

    // Atomically push driver rejection record and always set bookingStatus to rejected
    const updateOps: any = {
      $push: { rejectedDrivers: rejectEntry },
      $set: {
        bookingStatus: "rejected",
        driverId: null,
        cancelledBy: "driver",
        cancellationReason: reason,
        cancelledAt: rejectTime,
      },
    };

    const updatedBooking = await DriverBooking.findByIdAndUpdate(
      booking._id,
      updateOps,
      { new: true }
    );

    const formattedRejectedDrivers = (updatedBooking?.rejectedDrivers || []).map((rd: any) => {
      const entryId = rd._id ? rd._id.toString() : "";
      const driverIdStr = rd.driverId
        ? (typeof rd.driverId === "object" && rd.driverId._id ? rd.driverId._id.toString() : rd.driverId.toString())
        : (typeof rd === "string" ? rd : entryId);

      return {
        _id: entryId,
        id: entryId,
        driverId: driverIdStr,
        reason: rd.reason || "Driver declined the ride",
        rejectTime: rd.rejectTime ? new Date(rd.rejectTime).toISOString() : new Date().toISOString(),
      };
    });

    // ⚡ Notify listening clients in the booking room
    emitBookingUpdate(booking.bookingId, "ride:new_available", {
      bookingId: booking.bookingId,
      driverId: driver._id.toString(),
      driverName: `${driver.firstName || ""} ${driver.lastName || ""}`.trim(),
      reason,
      status: updatedBooking?.bookingStatus || "rejected",
      rejectedDrivers: formattedRejectedDrivers,
    });

    // 🔔 Send Push Notification to Customer and Admin on rejection
    try {
      const customer = await Customer.findById(booking.userId);
      const driverName = `${driver.firstName || ""} ${driver.lastName || ""}`.trim() || "Driver";

      if (customer?.fcmToken) {
        await dispatchNotification({
          title: "Ride Update ⚠️",
          message: `Your driver has declined ride ${booking.bookingId}. We are looking for another driver.`,
          targetAudience: "Customers",
          token: customer.fcmToken,
          type: "Alert",
          data: {
            bookingId: booking.bookingId,
            bookingStatus: "rejected",
          },
        });
      }

      // 🔔 Send Push Notification to Admin
      await dispatchNotification({
        title: "Driver Declined Ride ⚠️",
        message: `${driverName} declined booking ${booking.bookingId}. Reason: ${reason}`,
        targetAudience: "All",
        topic: "admin",
        type: "Alert",
        data: {
          bookingId: booking.bookingId,
          driverId: driver._id.toString(),
          reason,
        },
      });
    } catch (notifErr: any) {
      console.warn("Could not dispatch push notification on reject:", notifErr?.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ride rejected successfully for this driver. Other drivers can still accept.",
        data: {
          bookingId: updatedBooking?.bookingId || booking.bookingId,
          bookingStatus: updatedBooking?.bookingStatus || "rejected",
          rejectedDriverId: driver._id.toString(),
          rejectedDrivers: formattedRejectedDrivers,
          reason,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reject ride error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
