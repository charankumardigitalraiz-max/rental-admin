import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetBooking from "@/models/valetBooking";
import ValetStaff from "@/models/valetStaff";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * Reusable helper to aggregate a valet booking with Customer and ValetStaff
 */
async function getPopulatedBooking(matchCriteria: any) {
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
        from: "valetstaffs",
        localField: "assignedStaffIds",
        foreignField: "_id",
        as: "valetStaffList",
        pipeline: [
          {
            $project: {
              name: 1,
              phone: 1,
              email: 1,
              staffId: 1,
              profileImage: 1,
              rating: 1,
              location: 1,
              address: 1,
              status: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "drivers",
        localField: "assignedStaffIds",
        foreignField: "_id",
        as: "driverList",
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
    {
      $addFields: {
        assignedStaff: {
          $concatArrays: [
            {
              $map: {
                input: "$valetStaffList",
                as: "vs",
                in: {
                  _id: "$$vs._id",
                  name: "$$vs.name",
                  phone: "$$vs.phone",
                  email: "$$vs.email",
                  staffId: "$$vs.staffId",
                  driverId: "$$vs.staffId",
                  profilePicture: "$$vs.profileImage",
                  profileImage: "$$vs.profileImage",
                  rating: "$$vs.rating",
                  location: "$$vs.location",
                  status: "$$vs.status",
                },
              },
            },
            {
              $map: {
                input: "$driverList",
                as: "d",
                in: {
                  _id: "$$d._id",
                  name: { $concat: ["$$d.firstName", " ", "$$d.lastName"] },
                  phone: "$$d.phone",
                  driverId: "$$d.driverId",
                  profilePicture: "$$d.profilePicture",
                  profileImage: "$$d.profilePicture",
                  rating: "$$d.rating",
                },
              },
            },
          ],
        },
      },
    },
    {
      $project: {
        valetStaffList: 0,
        driverList: 0,
      },
    },
  ]);
  return bookings[0] || null;
}

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

    const booking = await getPopulatedBooking(matchCriteria);

    if (!booking) {
      return NextResponse.json({ success: false, error: "Valet booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking }, { status: 200 });
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

    const previousStaffIds = (booking.assignedStaffIds || []).map((sid: any) => sid.toString());

    if (Array.isArray(assignedStaffIds)) {
      booking.assignedStaffIds = assignedStaffIds
        .filter((sid: string) => mongoose.Types.ObjectId.isValid(sid))
        .map((sid: string) => new mongoose.Types.ObjectId(sid));

      // Automatically adjust assignment status if not explicitly overridden
      if (!status) {
        if (booking.assignedStaffIds.length === 0) {
          booking.status = "pending_assignment";
        } else if (booking.assignedStaffIds.length >= (booking.person || 1)) {
          booking.status = "fully_assigned";
        } else {
          booking.status = "partially_assigned";
        }
      }
    }

    if (status) {
      booking.status = status;
      if (status === "cancelled") {
        booking.cancelledBy = "admin";
        booking.cancelledAt = new Date();
        if (cancellationReason) booking.cancellationReason = cancellationReason;
      }
    }

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    await booking.save();

    // Synchronize ValetStaff model availability
    const currentStaffIds = (booking.assignedStaffIds || []).map((sid: any) => sid.toString());
    const removedStaffIds = previousStaffIds.filter((sid: string) => !currentStaffIds.includes(sid));

    if (currentStaffIds.length > 0) {
      await ValetStaff.updateMany(
        { _id: { $in: currentStaffIds.map((sid: string) => new mongoose.Types.ObjectId(sid)) } },
        { $set: { isAvailable: false } }
      );
    }

    if (removedStaffIds.length > 0) {
      for (const removedId of removedStaffIds) {
        const activeCount = await ValetBooking.countDocuments({
          _id: { $ne: booking._id },
          assignedStaffIds: new mongoose.Types.ObjectId(removedId),
          status: { $in: ["in_progress", "fully_assigned", "partially_assigned"] },
        });
        if (activeCount === 0) {
          await ValetStaff.findByIdAndUpdate(removedId, { $set: { isAvailable: true } });
        }
      }
    }

    // Return fully populated booking document
    const updatedPopulated = await getPopulatedBooking({ _id: booking._id });

    return NextResponse.json(
      {
        success: true,
        message: "Valet booking updated successfully",
        data: updatedPopulated || booking,
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
