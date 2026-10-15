import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/admin/driver-bookings/[id]
 * Fetch single booking details using aggregation pipeline with $lookup
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const matchCriteria: any = {
      $or: [
        { bookingId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const bookings = await DriverBooking.aggregate([
      { $match: matchCriteria },
      { $limit: 1 },
      // Customer lookup
      {
        $lookup: {
          from: "customers",
          localField: "userId",
          foreignField: "_id",
          as: "userdetails",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                custId: 1,
                avatar: 1,
                profileImage: 1,
                address: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$userdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Driver lookup
      {
        $lookup: {
          from: "drivers",
          localField: "driverId",
          foreignField: "_id",
          as: "driverdetails",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                driverId: 1,
                profilePicture: 1,
                status: 1,
                vehicle: 1,
                rating: 1,
                licenseNumber: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$driverdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const booking = bookings[0];

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking }, { status: 200 });
  } catch (error: any) {
    console.error("Admin driver booking GET [id] aggregation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/driver-bookings/[id]
 * Allows admin to assign/reassign driver, update booking status, cancel booking, or add admin notes.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const query: any = {
      $or: [
        { bookingId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const booking = await DriverBooking.findOne(query);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const {
      driverId,
      bookingStatus,
      paymentStatus,
      adminNotes,
      cancellationReason,
    } = body;

    // Assign / Reassign driver
    if (driverId !== undefined) {
      if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
        booking.driverId = new mongoose.Types.ObjectId(driverId);
        if (booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") {
          booking.bookingStatus = "driver_assigned";
        }
      } else if (driverId === null || driverId === "") {
        booking.driverId = null;
      }
    }

    // Update booking status
    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
      if (bookingStatus === "cancelled") {
        booking.cancelledBy = "admin";
        booking.cancelledAt = new Date();
        if (cancellationReason) {
          booking.cancellationReason = cancellationReason;
        }
      } else if (bookingStatus === "trip_started" && !booking.tripStartedAt) {
        booking.tripStartedAt = new Date();
      } else if (bookingStatus === "trip_completed" && !booking.tripCompletedAt) {
        booking.tripCompletedAt = new Date();
      }
    }

    // Update payment status
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    // Update admin notes
    if (adminNotes !== undefined) {
      booking.adminNotes = adminNotes;
    }

    await booking.save();

    // Use aggregation to return the enriched updated booking
    const [updatedBooking] = await DriverBooking.aggregate([
      { $match: { _id: booking._id } },
      { $limit: 1 },
      {
        $lookup: {
          from: "customers",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                custId: 1,
                avatar: 1,
                profileImage: 1,
                address: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$userId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "drivers",
          localField: "driverId",
          foreignField: "_id",
          as: "driverId",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                driverId: 1,
                profilePicture: 1,
                status: 1,
                vehicle: 1,
                rating: 1,
                licenseNumber: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$driverId",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Booking updated successfully",
        data: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin driver booking PATCH [id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
