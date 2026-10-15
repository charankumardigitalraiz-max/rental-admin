import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetStaff from "@/models/valetStaff";
import ValetBooking from "@/models/valetBooking";
import { verifyAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/uploadFile";
import mongoose from "mongoose";

/**
 * GET /api/admin/valet-staff/[id]
 * Fetch single staff by MongoDB _id or staffId,
 * with search, filtering, and pagination for their assigned valet bookings
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

    const query: any = {
      $or: [
        { staffId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const staff = await ValetStaff.findOne(query);

    if (!staff) {
      return NextResponse.json({ success: false, error: "Valet staff not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "5", 10)));
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isAll = searchParams.get("all") === "true";

    // 1. Overall staff metrics across all their bookings
    const [totalAssignedBookings, activeBookingsCount, completedBookingsCount, cancelledBookingsCount] =
      await Promise.all([
        ValetBooking.countDocuments({ assignedStaffIds: staff._id }),
        ValetBooking.countDocuments({
          assignedStaffIds: staff._id,
          status: { $in: ["in_progress", "fully_assigned", "partially_assigned"] },
        }),
        ValetBooking.countDocuments({ assignedStaffIds: staff._id, status: "completed" }),
        ValetBooking.countDocuments({ assignedStaffIds: staff._id, status: "cancelled" }),
      ]);

    // 2. Determine current active duty deployment
    const activeBooking = await ValetBooking.findOne({
      assignedStaffIds: staff._id,
      status: { $in: ["in_progress", "fully_assigned", "partially_assigned"] },
    })
      .sort({ eventDate: 1, createdAt: -1 })
      .lean();

    const currentAssignment = activeBooking
      ? {
        bookingId: (activeBooking as any).bookingId || (activeBooking as any)._id.toString(),
        eventName: (activeBooking as any).eventName,
        venue:
          (activeBooking as any).venueName ||
          (activeBooking as any).address ||
          (activeBooking as any).location?.address ||
          "Assigned Venue",
        status: (activeBooking as any).status,
        eventDate: (activeBooking as any).eventDate,
        startTime: (activeBooking as any).startTime,
        endTime: (activeBooking as any).endTime,
      }
      : null;

    // 3. Build filter query ONLY for valet bookings
    const bookingQuery: any = {
      assignedStaffIds: staff._id,
    };

    if (status && status !== "all") {
      if (status === "active") {
        bookingQuery.status = { $in: ["in_progress", "fully_assigned", "partially_assigned"] };
      } else if (status === "completed") {
        bookingQuery.status = "completed";
      } else if (status === "cancelled") {
        bookingQuery.status = "cancelled";
      } else if (status === "pending") {
        bookingQuery.status = { $in: ["pending_assignment", "new_request"] };
      } else {
        bookingQuery.status = status;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      bookingQuery.$or = [
        { bookingId: searchRegex },
        { eventName: searchRegex },
        { venueName: searchRegex },
        { address: searchRegex },
        { "location.address": searchRegex },
      ];
    }

    if (startDate || endDate) {
      bookingQuery.eventDate = {};
      if (startDate) bookingQuery.eventDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        bookingQuery.eventDate.$lte = end;
      }
    }

    // 4. Paginate bookings
    const totalMatchingBookings = await ValetBooking.countDocuments(bookingQuery);
    const totalPages = Math.ceil(totalMatchingBookings / limit) || 1;
    const skip = (page - 1) * limit;

    let bookingsQuery = ValetBooking.find(bookingQuery)
      .sort({ eventDate: -1, createdAt: -1 })
      .populate({
        path: "userId",
        select: "firstName lastName phone email custId",
      });

    if (!isAll) {
      bookingsQuery = bookingsQuery.skip(skip).limit(limit);
    }

    const staffBookings = await bookingsQuery.lean();

    const staffObj: any = staff.toObject ? staff.toObject() : staff;
    staffObj.assignedEventsCount = totalAssignedBookings;
    staffObj.activeEventsCount = activeBookingsCount;
    staffObj.completedEventsCount = completedBookingsCount;
    staffObj.cancelledEventsCount = cancelledBookingsCount;
    staffObj.currentAssignment = currentAssignment;
    staffObj.bookings = staffBookings;
    staffObj.bookingsPagination = {
      page: isAll ? 1 : page,
      limit: isAll ? totalMatchingBookings : limit,
      total: totalMatchingBookings,
      totalPages: isAll ? 1 : totalPages,
    };
    staffObj.bookingCounts = {
      all: totalAssignedBookings,
      active: activeBookingsCount,
      completed: completedBookingsCount,
      cancelled: cancelledBookingsCount,
    };

    return NextResponse.json({ success: true, data: staffObj }, { status: 200 });
  } catch (error: any) {
    console.error("Valet staff GET [id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/valet-staff/[id]
 * Release staff from a booking or update staff status
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
        { staffId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const staff = await ValetStaff.findOne(query);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Valet staff not found" }, { status: 404 });
    }

    const { action, bookingId, status } = body;

    // Handle release / unassign booking action
    if (action === "release_booking" || action === "unassign" || (bookingId && !status)) {
      if (!bookingId) {
        return NextResponse.json(
          { success: false, error: "bookingId is required to release attendant" },
          { status: 400 }
        );
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
        return NextResponse.json(
          { success: false, error: "Valet booking not found" },
          { status: 404 }
        );
      }

      // Check if staff was actually assigned
      const wasAssigned = (booking.assignedStaffIds || []).some(
        (sid: any) => sid.toString() === staff._id.toString()
      );

      if (!wasAssigned) {
        return NextResponse.json(
          { success: false, error: "Staff is not assigned to this booking" },
          { status: 400 }
        );
      }

      // Remove staff from assignedStaffIds
      booking.assignedStaffIds = (booking.assignedStaffIds || []).filter(
        (sid: any) => sid.toString() !== staff._id.toString()
      );

      // Automatically adjust booking assignment status
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

      // Check if this staff has any remaining active bookings
      const remainingActiveBookings = await ValetBooking.countDocuments({
        assignedStaffIds: staff._id,
        status: { $in: ["in_progress", "fully_assigned", "partially_assigned"] },
      });

      if (remainingActiveBookings === 0) {
        staff.isAvailable = true;
        await staff.save();
      }

      return NextResponse.json(
        {
          success: true,
          message: `Attendant ${staff.name} successfully released from booking ${booking.bookingId || bookingId}`,
          data: {
            staffId: staff.staffId,
            staffName: staff.name,
            bookingId: booking.bookingId,
            bookingStatus: booking.status,
            isAvailable: staff.isAvailable,
            remainingActiveEvents: remainingActiveBookings,
          },
        },
        { status: 200 }
      );
    }

    // Handle status update
    if (status) {
      staff.status = status;
      await staff.save();
      return NextResponse.json(
        { success: true, message: "Staff status updated", data: staff },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or parameters specified" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Valet staff PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/valet-staff/[id]
 * Update valet staff details (supports JSON and Multipart FormData for file re-upload)
 */
export async function PUT(
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
        { staffId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const existingStaff = await ValetStaff.findOne(query);
    if (!existingStaff) {
      return NextResponse.json({ success: false, error: "Valet staff not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    const updateData: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      if (formData.has("name")) updateData.name = (formData.get("name") as string).trim();
      if (formData.has("phone")) updateData.phone = (formData.get("phone") as string).trim();
      if (formData.has("email")) updateData.email = (formData.get("email") as string).trim();
      if (formData.has("dateOfBirth")) {
        const dob = formData.get("dateOfBirth") as string;
        updateData.dateOfBirth = dob ? new Date(dob) : undefined;
      }
      if (formData.has("bloodGroup")) updateData.bloodGroup = (formData.get("bloodGroup") as string).trim();
      if (formData.has("address")) updateData.address = (formData.get("address") as string).trim();
      if (formData.has("location")) updateData.location = (formData.get("location") as string).trim();
      if (formData.has("status")) updateData.status = (formData.get("status") as string).trim();
      if (formData.has("notes")) updateData.notes = (formData.get("notes") as string).trim();

      // Proof updates
      if (formData.has("proofType") || formData.has("identityNumber")) {
        updateData.proof = {
          ...((existingStaff.proof as any)?.toObject?.() || existingStaff.proof),
        };
        if (formData.has("proofType")) {
          updateData.proof.proofType = (formData.get("proofType") as string).trim();
        }
        if (formData.has("identityNumber")) {
          updateData.proof.identityNumber = (formData.get("identityNumber") as string).trim();
        }
      }

      // Proof Image upload
      const proofFile = formData.get("proofImage");
      if (proofFile && typeof proofFile !== "string") {
        const uploadedUrl = await uploadFile(proofFile as File);
        if (uploadedUrl) {
          updateData.proof = updateData.proof || { ...((existingStaff.proof as any)?.toObject?.() || existingStaff.proof) };
          updateData.proof.proofImage = uploadedUrl;
        }
      } else if (typeof proofFile === "string" && proofFile) {
        updateData.proof = updateData.proof || { ...((existingStaff.proof as any)?.toObject?.() || existingStaff.proof) };
        updateData.proof.proofImage = proofFile;
      }

      // Proof Back image upload
      const proofBackFile = formData.get("proofImageBack");
      if (proofBackFile && typeof proofBackFile !== "string") {
        const uploadedBackUrl = await uploadFile(proofBackFile as File);
        if (uploadedBackUrl) {
          updateData.proof = updateData.proof || { ...((existingStaff.proof as any)?.toObject?.() || existingStaff.proof) };
          updateData.proof.proofImageBack = uploadedBackUrl;
        }
      }

      // Profile Image upload
      const profileFile = formData.get("profileImage");
      if (profileFile && typeof profileFile !== "string") {
        const profileUrl = await uploadFile(profileFile as File);
        if (profileUrl) updateData.profileImage = profileUrl;
      } else if (typeof profileFile === "string" && profileFile) {
        updateData.profileImage = profileFile;
      }
    } else {
      // JSON body
      const body = await req.json();
      delete body.staffId; // Do not allow manual staffId update
      delete body._id;

      Object.assign(updateData, body);

      if (body.dateOfBirth) {
        updateData.dateOfBirth = new Date(body.dateOfBirth);
      }
    }

    // Check duplicate phone if phone is modified
    if (updateData.phone && updateData.phone !== existingStaff.phone) {
      const duplicate = await ValetStaff.findOne({
        phone: updateData.phone,
        _id: { $ne: existingStaff._id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Another staff member is already using this phone number" },
          { status: 400 }
        );
      }
    }

    const updatedStaff = await ValetStaff.findByIdAndUpdate(
      existingStaff._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Valet staff updated successfully",
        data: updatedStaff,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Valet staff PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/valet-staff/[id]
 * Remove valet staff member
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
        { staffId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
      ],
    };

    const deletedStaff = await ValetStaff.findOneAndDelete(query);
    if (!deletedStaff) {
      return NextResponse.json({ success: false, error: "Valet staff not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Valet staff deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Valet staff DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
