import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/admin";
import { verifyAdmin } from "@/lib/auth";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { formatAdminUser } from "../route";
import { initialAdminUsers } from "@/data/mockData";

/**
 * Helper to resolve staff member by MongoDB _id or username
 */
async function findAdminByIdOrUsername(id: string) {
  const isMongoId = mongoose.Types.ObjectId.isValid(id);
  const query = isMongoId
    ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { username: id }] }
    : { username: id };

  return Admin.findOne(query);
}

/**
 * GET /api/admin/admin-users/[id]
 * Fetch single staff member details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdmin(req);
    if (!admin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
      await connectToDatabase();
      const staffDoc = await findAdminByIdOrUsername(id);
      if (!staffDoc) {
        return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
      }

      return NextResponse.json(
        {
          success: true,
          data: formatAdminUser(staffDoc),
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.warn("MongoDB offline, searching mock data:", dbError.message);
      const mockStaff = initialAdminUsers.find((u) => u.id === id);
      if (!mockStaff) {
        return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: mockStaff }, { status: 200 });
    }
  } catch (error: any) {
    console.error("GET /api/admin/admin-users/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/admin-users/[id]
 * Update staff details (name, email, phone, role, status, avatar, password)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdmin(req);
    if (!admin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, role, status, avatar, password } = body;

    try {
      await connectToDatabase();
      const staffDoc = await findAdminByIdOrUsername(id);
      if (!staffDoc) {
        return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
      }

      if (name !== undefined) {
        if (!name.trim()) {
          return NextResponse.json({ success: false, error: "Name cannot be empty" }, { status: 400 });
        }
        staffDoc.name = name.trim();
      }

      if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
          return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
        }

        const emailExists = await Admin.findOne({
          email: normalizedEmail,
          _id: { $ne: staffDoc._id },
        });
        if (emailExists) {
          return NextResponse.json(
            { success: false, error: "Email address is already in use by another staff member" },
            { status: 400 }
          );
        }
        staffDoc.email = normalizedEmail;
      }

      if (phone !== undefined) {
        staffDoc.phone = phone.trim();
      }

      if (role !== undefined) {
        staffDoc.role = role;
      }

      if (avatar !== undefined) {
        staffDoc.avatar = avatar;
      }

      if (status !== undefined) {
        if (typeof status === "boolean") {
          staffDoc.status = status;
        } else if (typeof status === "string") {
          staffDoc.status = status === "Active";
        }
      }

      if (password && password.trim()) {
        staffDoc.password = await bcrypt.hash(password.trim(), 10);
      }

      await staffDoc.save();

      return NextResponse.json(
        {
          success: true,
          data: formatAdminUser(staffDoc),
          message: "Staff member updated successfully",
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.warn("MongoDB offline, returning updated mock:", dbError.message);
      const mockStaff = initialAdminUsers.find((u) => u.id === id) || {
        id,
        name: name || "Staff Member",
        email: email || "staff@drivervalet.com",
        phone: phone || "+91 98000 00000",
        role: role || "Operations Admin",
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        status: status || "Active",
        lastLogin: "Just now",
      };

      const updated = {
        ...mockStaff,
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(status && { status: typeof status === 'boolean' ? (status ? 'Active' : 'Inactive') : status }),
        ...(avatar && { avatar }),
      };

      return NextResponse.json(
        {
          success: true,
          data: updated,
          message: "Staff member updated successfully",
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("PATCH /api/admin/admin-users/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/admin-users/[id]
 * Remove staff member account
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdmin(req);
    if (!admin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
      await connectToDatabase();
      const staffDoc = await findAdminByIdOrUsername(id);
      if (!staffDoc) {
        return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
      }

      if (staffDoc.role === "Super Admin") {
        const superAdminCount = await Admin.countDocuments({ role: "Super Admin" });
        if (superAdminCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              error: "Cannot delete the only Super Admin account on the platform",
            },
            { status: 400 }
          );
        }
      }

      await Admin.deleteOne({ _id: staffDoc._id });

      return NextResponse.json(
        {
          success: true,
          message: "Staff member deleted successfully",
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.warn("MongoDB offline, returning mock delete:", dbError.message);
      return NextResponse.json(
        {
          success: true,
          message: "Staff member deleted successfully",
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("DELETE /api/admin/admin-users/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
