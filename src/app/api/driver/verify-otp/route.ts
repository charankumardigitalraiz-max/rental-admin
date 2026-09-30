import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Otp from "@/models/otp";
import Driver from "@/models/driver";
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

    // Check if driver exists
    const driver = await Driver.findOne({ phone });

    if (!driver) {
      return NextResponse.json({
        success: true,
        isRegistered: false,
        message: "Driver not registered",
      });
    }

    // Driver exists, generate token
    const token = jwt.sign(
      { id: driver._id, role: "driver" },
      process.env.JWT_SECRET || "fallback",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      isRegistered: true,
      message: "OTP verified and logged in successfully",
      token,
      driver: {
        id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        email: driver.email,
        driverId: driver.driverId,
      }
    });
  } catch (error) {
    console.error("Driver OTP verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
