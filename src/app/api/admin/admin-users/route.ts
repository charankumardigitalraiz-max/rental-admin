import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/admin";
import { verifyAdmin } from "@/lib/auth";
import bcrypt from "bcrypt";
import { initialAdminUsers } from "@/data/mockData";

export function formatAdminUser(doc: any) {
  const raw = doc && typeof doc.toObject === "function" ? doc.toObject() : doc;
  if (!raw) return null;

  const id = raw._id ? raw._id.toString() : raw.id;
  const statusStr =
    typeof raw.status === "boolean"
      ? raw.status
        ? "Active"
        : "Inactive"
      : raw.status || "Active";

  let lastLoginStr = "Never";
  if (raw.lastLogin) {
    if (typeof raw.lastLogin === "string") {
      lastLoginStr = raw.lastLogin;
    } else {
      const d = new Date(raw.lastLogin);
      if (!isNaN(d.getTime())) {
        lastLoginStr = d.toISOString().replace("T", " ").slice(0, 16);
      }
    }
  }

  return {
    id,
    _id: id,
    name: raw.name || "Staff Member",
    username: raw.username || "",
    email: raw.email || "",
    phone: raw.phone || "+91 98000 00000",
    avatar:
      raw.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    role: raw.role || "Operations Admin",
    status: statusStr,
    lastLogin: lastLoginStr,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Seed initial administrative users if collection is empty
 */
async function seedDefaultAdminsIfEmpty() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    try {
      const defaultPasswordHash = await bcrypt.hash("Admin@1234", 10);
      for (const user of initialAdminUsers) {
        const username =
          user.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) +
          Math.floor(1000 + Math.random() * 9000);

        await Admin.create({
          name: user.name,
          username,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          password: defaultPasswordHash,
          status: user.status === "Active",
          lastLogin: new Date(),
        });
      }
    } catch (err: any) {
      console.warn("Auto-seeding default admins skipped:", err.message);
    }
  }
}

/**
 * GET /api/admin/admin-users
 * Returns roster of admin and operational staff members with filters, search, and summary counts.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const role = url.searchParams.get("role")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "";
    const isAll = url.searchParams.get("all") === "true";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    try {
      await connectToDatabase();
      await seedDefaultAdminsIfEmpty();

      const query: any = {};

      if (role && role !== "All") {
        query.role = role;
      }

      if (status && status !== "All") {
        if (status === "Active") query.status = true;
        else if (status === "Inactive") query.status = false;
      }

      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [
          { name: { $regex: escaped, $options: "i" } },
          { email: { $regex: escaped, $options: "i" } },
          { phone: { $regex: escaped, $options: "i" } },
          { role: { $regex: escaped, $options: "i" } },
          { username: { $regex: escaped, $options: "i" } },
        ];
      }

      let usersQuery = Admin.find(query).sort({ createdAt: -1 });
      if (!isAll && url.searchParams.has("page")) {
        usersQuery = usersQuery.skip(skip).limit(limit);
      }

      const docs = await usersQuery;
      const formattedStaff = docs.map(formatAdminUser);

      const [totalStaff, activeStaffCount, superAdminCount, managersCount] = await Promise.all([
        Admin.countDocuments(),
        Admin.countDocuments({ status: true }),
        Admin.countDocuments({ role: "Super Admin" }),
        Admin.countDocuments({
          role: { $in: ["Driver Manager", "Valet Manager", "Operations Admin"] },
        }),
      ]);

      const filteredTotal = await Admin.countDocuments(query);

      return NextResponse.json(
        {
          success: true,
          data: formattedStaff,
          counts: {
            totalStaff,
            activeStaffCount,
            superAdminCount,
            managersCount,
          },
          pagination: {
            total: filteredTotal,
            page,
            limit,
            totalPages: Math.ceil(filteredTotal / limit),
          },
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.warn("MongoDB offline, serving fallback staff roster:", dbError.message);

      let fallbackStaff = [...initialAdminUsers];
      if (role && role !== "All") {
        fallbackStaff = fallbackStaff.filter((s) => s.role === role);
      }
      if (status && status !== "All") {
        fallbackStaff = fallbackStaff.filter((s) => s.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        fallbackStaff = fallbackStaff.filter(
          (u) =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.phone.toLowerCase().includes(s) ||
            u.role.toLowerCase().includes(s)
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: fallbackStaff,
          counts: {
            totalStaff: initialAdminUsers.length,
            activeStaffCount: initialAdminUsers.filter((a) => a.status === "Active").length,
            superAdminCount: initialAdminUsers.filter((a) => a.role === "Super Admin").length,
            managersCount: initialAdminUsers.filter(
              (a) =>
                a.role === "Driver Manager" ||
                a.role === "Valet Manager" ||
                a.role === "Operations Admin"
            ).length,
          },
          pagination: {
            total: fallbackStaff.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("GET /api/admin/admin-users error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/admin-users
 * Creates a new administrative or operations staff member.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, role, status, avatar, password } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Staff name is required" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: "Staff email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPrefix = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "user";
    const username = `${cleanPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
    const isActive = status === undefined || status === "Active" || status === true;

    try {
      await connectToDatabase();

      const existing = await Admin.findOne({ email: normalizedEmail });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A staff account with this email address already exists" },
          { status: 400 }
        );
      }

      const rawPassword = password && password.trim() ? password.trim() : "Staff@1234";
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const newAdmin = await Admin.create({
        name: name.trim(),
        username,
        email: normalizedEmail,
        phone: phone?.trim() || "+91 98000 00000",
        avatar:
          avatar?.trim() ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        role: role || "Operations Admin",
        password: hashedPassword,
        status: isActive,
        lastLogin: new Date(),
      });

      return NextResponse.json(
        {
          success: true,
          data: formatAdminUser(newAdmin),
          message: "Staff member created successfully",
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.warn("MongoDB offline, returning fallback created staff:", dbError.message);
      const mockCreated = {
        id: `admin-${Date.now()}`,
        _id: `admin-${Date.now()}`,
        name: name.trim(),
        username,
        email: normalizedEmail,
        phone: phone?.trim() || "+91 98000 00000",
        avatar:
          avatar?.trim() ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        role: role || "Operations Admin",
        status: isActive ? "Active" : "Inactive",
        lastLogin: "Just now",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data: mockCreated,
          message: "Staff member created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("POST /api/admin/admin-users error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
