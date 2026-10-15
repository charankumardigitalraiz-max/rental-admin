import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetBooking from "@/models/valetBooking";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/admin/valet-bookings/[id]
 * Fetch single valet booking details by ID
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

    const bookings = await ValetBooking.aggregate([
      { $match: matchCriteria },
      { $limit: 1 },
      {
        $lookup: {
          from: "customers",
          localField: "userId",
          foreignField: "_id",
          as: "customer",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                custId: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "drivers",
          localField: "assignedStaffIds",
          foreignField: "_id",
          as: "assignedStaff",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                phone: 1,
                driverId: 1,
                profilePicture: 1,
                rating: 1,
              },
            },
          ],
        },
      },
    ]);

    if (!bookings.length) {
      return NextResponse.json({ success: false, error: "Valet booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bookings[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Admin valet booking GET [id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/valet-bookings/[id]
 * Update status, staff assignments, notes, etc.
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

    const booking = await ValetBooking.findOne(query);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Valet booking not found" }, { status: 404 });
    }

    const {
      status,
      assignedStaffIds,
      paymentStatus,
      adminNotes,
      cancellationReason,
    } = body;

    if (status) {
      booking.status = status;
      if (status === "cancelled") {
        booking.cancelledBy = "admin";
        booking.cancelledAt = new Date();
        if (cancellationReason) booking.cancellationReason = cancellationReason;
      }
    }

    if (Array.isArray(assignedStaffIds)) {
      booking.assignedStaffIds = assignedStaffIds
        .filter((sid: string) => mongoose.Types.ObjectId.isValid(sid))
        .map((sid: string) => new mongoose.Types.ObjectId(sid));
    }

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: "Valet booking updated successfully",
        data: booking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin valet booking PATCH [id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
