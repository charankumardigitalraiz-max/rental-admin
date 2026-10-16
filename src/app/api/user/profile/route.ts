import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/customer";
import jwt from "jsonwebtoken";

// Middleware-like function to verify token
const verifyToken = (request: NextRequest) => {
  const token = request.cookies.get("user_token")?.value || request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return { error: "Unauthorized: No token provided" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback") as { id: string; role: string };
    return { decoded };
  } catch (error) {
    return { error: "Unauthorized: Invalid token" };
  }
};

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
    }

    const { id } = authResult.decoded!;

    await connectToDatabase();
    
    const customer = await Customer.findById(id).select("-__v");
    if (!customer) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile fetched successfully",
      user: customer,
    });
  } catch (error) {
    console.error("User profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
    }

    const { id } = authResult.decoded!;

    const body = await request.json();
    const { firstName, lastName, email, phone, address, fcmToken } = body;

    await connectToDatabase();

    // Ensure email and phone are unique if they are being updated
    if (email) {
      const existingEmail = await Customer.findOne({ email, _id: { $ne: id } });
      if (existingEmail) {
        return NextResponse.json({ success: false, message: "Email is already in use" }, { status: 400 });
      }
    }

    if (phone) {
      const existingPhone = await Customer.findOne({ phone, _id: { $ne: id } });
      if (existingPhone) {
        return NextResponse.json({ success: false, message: "Phone number is already in use" }, { status: 400 });
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(fcmToken && { fcmToken }),
        },
      },
      { new: true, runValidators: true }
    ).select("-__v");

    if (fcmToken) {
      try {
        const { subscribeTokensToTopic } = await import("@/lib/firebase-admin");
        await subscribeTokensToTopic([fcmToken], "customers");
        await subscribeTokensToTopic([fcmToken], "all");
      } catch (err: any) {
        console.warn("Could not subscribe customer FCM token to topics:", err?.message);
      }
    }

    if (!updatedCustomer) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedCustomer,
    });
  } catch (error) {
    console.error("User profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
