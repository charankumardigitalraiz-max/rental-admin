import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetStaff from "@/models/valetStaff";
import { verifyAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/uploadFile";

/**
 * Helper to generate staff ID (e.g. VS20260001)
 */
async function generateStaffId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VS${year}`;
  const lastStaff = await ValetStaff.findOne({ staffId: new RegExp(`^${prefix}`) })
    .sort({ staffId: -1 })
    .select("staffId");

  let sequence = 1;
  if (lastStaff && lastStaff.staffId) {
    const lastSeq = parseInt(lastStaff.staffId.replace(prefix, ""), 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }
  return `${prefix}${sequence.toString().padStart(4, "0")}`;
}

/**
 * GET /api/admin/valet-staff
 * List all valet staff with pagination, search, status, and summary counts.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    const search = url.searchParams.get("search");
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { staffId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "proof.identityNumber": { $regex: search, $options: "i" } },
      ];
    }

    const status = url.searchParams.get("status");
    if (status && status !== "All") {
      if (status === "Available") {
        query.status = "active";
        query.isAvailable = true;
      } else if (status === "On Duty" || status === "Assigned") {
        query.status = "active";
        query.isAvailable = false;
      } else if (status === "Offline") {
        query.status = "inactive";
      } else {
        query.status = status.toLowerCase();
      }
    }

    const isAvailable = url.searchParams.get("isAvailable");
    if (isAvailable !== null && isAvailable !== undefined && isAvailable !== "") {
      query.isAvailable = isAvailable === "true";
    }

    const bloodGroup = url.searchParams.get("bloodGroup");
    if (bloodGroup && bloodGroup !== "All") {
      query.bloodGroup = bloodGroup;
    }

    const proofType = url.searchParams.get("proofType");
    if (proofType && proofType !== "All") {
      const cleanProof = proofType.replace(/Card|License/gi, "").trim();
      query["proof.proofType"] = { $regex: cleanProof, $options: "i" };
    }

    const location = url.searchParams.get("location");
    if (location && location !== "All") {
      const locRegex = { $regex: location, $options: "i" };
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: [{ location: locRegex }, { address: locRegex }] },
        ];
        delete query.$or;
      } else {
        query.$or = [{ location: locRegex }, { address: locRegex }];
      }
    }

    const [staffList, totalCount, activeCount, inactiveCount, availableCount, onDutyCount] = await Promise.all([
      ValetStaff.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ValetStaff.countDocuments(query),
      ValetStaff.countDocuments({ status: "active" }),
      ValetStaff.countDocuments({ status: { $in: ["inactive", "suspended"] } }),
      ValetStaff.countDocuments({ status: "active", isAvailable: { $ne: false } }),
      ValetStaff.countDocuments({ status: "active", isAvailable: false }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          staff: staffList,
          counts: {
            total: totalCount,
            active: activeCount,
            inactive: inactiveCount,
            available: availableCount,
            onDuty: onDutyCount,
          },
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Valet staff GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/valet-staff
 * Create new valet staff member with image upload support (FormData) or JSON payload.
 *
 * Supported Fields:
 * - name (required)
 * - phone (required)
 * - email (optional)
 * - dateOfBirth (optional, YYYY-MM-DD)
 * - bloodGroup (optional, e.g. A+, B+, O+, AB+, etc.)
 * - proofType (required, e.g. aadhaar, driving_license, pan, voter_id, passport)
 * - identityNumber (required)
 * - proofImage (file upload or image URL)
 * - proofImageBack (optional file upload or image URL)
 * - profileImage (optional file upload or image URL)
 * - emergencyContactPhone (required)
 * - emergencyContactName (optional)
 * - emergencyContactRelationship (optional)
 * - address (optional)
 * - status (optional: active, inactive, pending, suspended)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let phone = "";
    let email = "";
    let dateOfBirth: Date | undefined;
    let bloodGroup = "";
    let proofType = "";
    let identityNumber = "";
    let proofImage = "";
    let proofImageBack = "";
    let profileImage = "";
    let address = "";
    let status = "active";
    let notes = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      name = (formData.get("name") as string)?.trim() || "";
      phone = (formData.get("phone") as string)?.trim() || "";
      email = (formData.get("email") as string)?.trim() || "";
      const dobStr = formData.get("dateOfBirth") as string;
      if (dobStr) dateOfBirth = new Date(dobStr);
      bloodGroup = (formData.get("bloodGroup") as string)?.trim() || "";

      proofType = (formData.get("proofType") as string)?.trim() || "";
      identityNumber = (formData.get("identityNumber") as string)?.trim() || "";

      address = (formData.get("address") as string)?.trim() || "";
      status = (formData.get("status") as string)?.trim() || "active";
      notes = (formData.get("notes") as string)?.trim() || "";

      // Handle proof image file or url string
      const proofFile = formData.get("proofImage");
      if (proofFile && typeof proofFile !== "string") {
        proofImage = (await uploadFile(proofFile as File)) || "";
      } else if (typeof proofFile === "string") {
        proofImage = proofFile;
      }

      // Handle proof back image if provided
      const proofBackFile = formData.get("proofImageBack");
      if (proofBackFile && typeof proofBackFile !== "string") {
        proofImageBack = (await uploadFile(proofBackFile as File)) || "";
      } else if (typeof proofBackFile === "string") {
        proofImageBack = proofBackFile;
      }

      // Handle profile image file if provided
      const profileFile = formData.get("profileImage");
      if (profileFile && typeof profileFile !== "string") {
        profileImage = (await uploadFile(profileFile as File)) || "";
      } else if (typeof profileFile === "string") {
        profileImage = profileFile;
      }
    } else {
      // JSON body
      const body = await req.json();

      name = body.name?.trim() || "";
      phone = body.phone?.trim() || "";
      email = body.email?.trim() || "";
      if (body.dateOfBirth) dateOfBirth = new Date(body.dateOfBirth);
      bloodGroup = body.bloodGroup?.trim() || "";

      proofType = body.proof?.proofType || body.proofType || "";
      identityNumber = body.proof?.identityNumber || body.identityNumber || "";
      proofImage = body.proof?.proofImage || body.proofImage || "";
      proofImageBack = body.proof?.proofImageBack || body.proofImageBack || "";
      profileImage = body.profileImage || "";

      address = body.address?.trim() || "";
      status = body.status || "active";
      notes = body.notes || "";
    }

    // Required fields validation
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
    }
    if (!proofType) {
      return NextResponse.json({ success: false, error: "Proof type is required" }, { status: 400 });
    }
    if (!identityNumber) {
      return NextResponse.json({ success: false, error: "Identity number is required" }, { status: 400 });
    }

    // Check duplicate phone
    const existing = await ValetStaff.findOne({ phone });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Valet staff with this phone number already exists" },
        { status: 400 }
      );
    }

    const staffId = await generateStaffId();

    const newStaff = await ValetStaff.create({
      staffId,
      name,
      phone,
      email: email || undefined,
      dateOfBirth,
      bloodGroup,
      proof: {
        proofType,
        identityNumber,
        proofImage: proofImage || undefined,
        proofImageBack: proofImageBack || undefined,
      },
      profileImage: profileImage || undefined,
      address: address || undefined,
      status,
      notes: notes || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Valet staff created successfully",
        data: newStaff,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Valet staff POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
