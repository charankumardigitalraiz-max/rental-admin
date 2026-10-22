import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverToDriverBooking from "@/models/driverToDriverBooking";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/admin/d-to-d-bookings/[id]
 * Fetch single Driver-to-Driver booking details using aggregation pipeline with $lookup
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

    const bookings = await DriverToDriverBooking.aggregate([
      { $match: matchCriteria },
      { $limit: 1 },
      // Lookup Source Driver
      {
        $lookup: {
          from: "drivers",
          localField: "sourceDriverId",
          foreignField: "_id",
          as: "sourcedriverdetails",
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
                rating: 1,
                licenseNumber: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$sourcedriverdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup Assigned Driver
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
      // Lookup Customer if attached
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
      // Lookup Original Driver Booking if linked
      {
        $lookup: {
          from: "driverbookings",
          localField: "driverBookingId",
          foreignField: "_id",
          as: "linkedbookingdetails",
          pipeline: [
            {
              $project: {
                bookingId: 1,
                serviceType: 1,
                tripType: 1,
                bookingStatus: 1,
                totalAmount: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$linkedbookingdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const booking = bookings[0];

    if (!booking) {
      return NextResponse.json({ success: false, error: "D-to-D booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking }, { status: 200 });
  } catch (error: any) {
    console.error("Admin D-to-D booking GET [id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/d-to-d-bookings/[id]
 * Update status, assign/reassign driver, cancel booking, or add notes
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

    const booking = await DriverToDriverBooking.findOne(query);
    if (!booking) {
      return NextResponse.json({ success: false, error: "D-to-D booking not found" }, { status: 404 });
    }

    const {
      driverId,
      bookingStatus,
      paymentStatus,
      adminNotes,
      driverNotes,
      cancellationReason,
    } = body;

    // Assign / Reassign driver
    if (driverId !== undefined) {
      if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
        booking.driverId = new mongoose.Types.ObjectId(driverId);
        if (!booking.driverAssignedAt) {
          booking.driverAssignedAt = new Date();
        }
        if (booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") {
          booking.bookingStatus = "driver_assigned";
        }
      } else if (driverId === null || driverId === "") {
        booking.driverId = null;
        booking.driverAssignedAt = null;
      }
    }

    // Update booking status
    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
      const now = new Date();

      if (bookingStatus === "driver_assigned") {
        if (!booking.driverAssignedAt) {
          booking.driverAssignedAt = now;
        }
      } else if (bookingStatus === "driver_arrived" || bookingStatus === "driver_arriving") {
        if (!booking.driverAssignedAt) {
          booking.driverAssignedAt = now;
        }
        if (!booking.driverArrivedAt) {
          booking.driverArrivedAt = now;
        }
      } else if (bookingStatus === "trip_started") {
        if (!booking.driverAssignedAt) {
          booking.driverAssignedAt = now;
        }
        if (!booking.driverArrivedAt) {
          booking.driverArrivedAt = now;
        }
        if (!booking.tripStartedAt) {
          booking.tripStartedAt = now;
        }
      } else if (bookingStatus === "trip_completed") {
        if (!booking.driverAssignedAt) {
          booking.driverAssignedAt = now;
        }
        if (!booking.driverArrivedAt) {
          booking.driverArrivedAt = now;
        }
        if (!booking.tripStartedAt) {
          booking.tripStartedAt = now;
        }
        if (!booking.tripCompletedAt) {
          booking.tripCompletedAt = now;
        }
        if (booking.paymentStatus === "pending") {
          booking.paymentStatus = "paid";
        }
      } else if (bookingStatus === "cancelled") {
        booking.cancelledBy = booking.cancelledBy || "admin";
        if (!booking.cancelledAt) {
          booking.cancelledAt = now;
        }
        if (cancellationReason) {
          booking.cancellationReason = cancellationReason;
        }
      }
    }

    // Update payment status
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    // Update notes
    if (adminNotes !== undefined) {
      booking.adminNotes = adminNotes;
    }
    if (driverNotes !== undefined) {
      booking.driverNotes = driverNotes;
    }

    // Save changes
    await booking.save();

    // Query updated populated booking
    const [populatedBooking] = await DriverToDriverBooking.aggregate([
      { $match: { _id: booking._id } },
      {
        $lookup: {
          from: "drivers",
          localField: "sourceDriverId",
          foreignField: "_id",
          as: "sourcedriverdetails",
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
                rating: 1,
                licenseNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$sourcedriverdetails", preserveNullAndEmptyArrays: true } },
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
                rating: 1,
                licenseNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$driverdetails", preserveNullAndEmptyArrays: true } },
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
              },
            },
          ],
        },
      },
      { $unwind: { path: "$userdetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "driverbookings",
          localField: "driverBookingId",
          foreignField: "_id",
          as: "linkedbookingdetails",
          pipeline: [
            {
              $project: {
                bookingId: 1,
                serviceType: 1,
                tripType: 1,
                bookingStatus: 1,
                totalAmount: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$linkedbookingdetails", preserveNullAndEmptyArrays: true } },
    ]);

    return NextResponse.json(
      { success: true, message: "D-to-D booking updated successfully", data: populatedBooking || booking },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin D-to-D booking PATCH [id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/d-to-d-bookings/[id]
 * Deletes or cancels a D-to-D booking
 */
export async function DELETE(
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

    const query: any = {
      $or: [
        { bookingId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const deleted = await DriverToDriverBooking.findOneAndDelete(query);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "D-to-D booking deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin D-to-D booking DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
