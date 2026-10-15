import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetStaff from "@/models/valetStaff";
import { verifyAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/uploadFile";
import mongoose from "mongoose";

/**
 * GET /api/admin/valet-staff/[id]
 * Fetch single staff by MongoDB _id or staffId
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

    return NextResponse.json({ success: true, data: staff }, { status: 200 });
  } catch (error: any) {
    console.error("Valet staff GET [id] error:", error);
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
      if (formData.has("status")) updateData.status = (formData.get("status") as string).trim();
      if (formData.has("notes")) updateData.notes = (formData.get("notes") as string).trim();

      // Proof updates
      if (formData.has("proofType") || formData.has("identityNumber")) {
        updateData.proof = {
          ...existingStaff.proof?.toObject?.() || existingStaff.proof,
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
          updateData.proof = updateData.proof || { ...(existingStaff.proof?.toObject?.() || existingStaff.proof) };
          updateData.proof.proofImage = uploadedUrl;
        }
      } else if (typeof proofFile === "string" && proofFile) {
        updateData.proof = updateData.proof || { ...(existingStaff.proof?.toObject?.() || existingStaff.proof) };
        updateData.proof.proofImage = proofFile;
      }

      // Proof Back image upload
      const proofBackFile = formData.get("proofImageBack");
      if (proofBackFile && typeof proofBackFile !== "string") {
        const uploadedBackUrl = await uploadFile(proofBackFile as File);
        if (uploadedBackUrl) {
          updateData.proof = updateData.proof || { ...(existingStaff.proof?.toObject?.() || existingStaff.proof) };
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
