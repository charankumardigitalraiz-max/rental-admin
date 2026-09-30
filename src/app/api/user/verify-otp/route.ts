import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Otp from "@/models/otp";
import Customer from "@/models/customer";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP not found or expired" },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 401 }
      );
    }

    // OTP is valid. Clear it from the database.
    await Otp.deleteOne({ phone });

    // Check if user exists
    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return NextResponse.json({
        success: true,
        isRegistered: false,
        message: "User not registered",
      });
    }

    // User exists, generate token
    const token = jwt.sign(
      { id: customer._id, role: "customer" },
      process.env.JWT_SECRET || "fallback",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      isRegistered: true,
      message: "OTP verified and logged in successfully",
      token,
      user: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        custId: customer.custId,
      }
    });

    response.cookies.set("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error("User OTP verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
