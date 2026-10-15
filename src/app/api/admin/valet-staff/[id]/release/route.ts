import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetStaff from "@/models/valetStaff";
import ValetBooking from "@/models/valetBooking";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * POST /api/admin/valet-staff/[id]/release
 * Dedicated endpoint to release/unassign a valet staff member from an event booking
 * Body: { bookingId: string }
 */
export async function POST(
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
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId is required in request body" },
        { status: 400 }
      );
    }

    const staffQuery: any = {
      $or: [
        { staffId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const staff = await ValetStaff.findOne(staffQuery);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Valet staff not found" }, { status: 404 });
    }

    const bookingQuery: any = {
      $or: [
        { bookingId: bookingId },
        ...(mongoose.Types.ObjectId.isValid(bookingId)
          ? [{ _id: new mongoose.Types.ObjectId(bookingId) }]
          : []),
      ],
    };

    const booking = await ValetBooking.findOne(bookingQuery);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Valet booking not found" }, { status: 404 });
    }

    const wasAssigned = (booking.assignedStaffIds || []).some(
      (sid: any) => sid.toString() === staff._id.toString()
    );

    if (!wasAssigned) {
      return NextResponse.json(
        { success: false, error: "This staff member is not currently assigned to this booking" },
        { status: 400 }
      );
    }

    // Unassign staff from booking
    booking.assignedStaffIds = (booking.assignedStaffIds || []).filter(
      (sid: any) => sid.toString() !== staff._id.toString()
    );

    // Adjust assignment status
    if (["partially_assigned", "fully_assigned", "in_progress"].includes(booking.status)) {
      if (booking.assignedStaffIds.length === 0) {
        booking.status = "pending_assignment";
      } else if (booking.assignedStaffIds.length >= (booking.person || 1)) {
        booking.status = "fully_assigned";
      } else {
        booking.status = "partially_assigned";
      }
    }

    await booking.save();

    // Check if staff has any remaining active bookings
    const remainingActiveCount = await ValetBooking.countDocuments({
      assignedStaffIds: staff._id,
      status: { $in: ["in_progress", "fully_assigned", "partially_assigned"] },
    });

    if (remainingActiveCount === 0) {
      staff.isAvailable = true;
      await staff.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: `Attendant ${staff.name} released from booking ${booking.bookingId || bookingId}`,
        data: {
          staffId: staff.staffId,
          staffName: staff.name,
          releasedBookingId: booking.bookingId,
          newBookingStatus: booking.status,
          isAvailable: staff.isAvailable,
          remainingActiveBookings: remainingActiveCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Valet staff release error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
