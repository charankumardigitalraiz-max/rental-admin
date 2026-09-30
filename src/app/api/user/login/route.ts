import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Otp from "@/models/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Determine if we should generate a dynamic OTP or use the dummy one
    const isDynamic = process.env.OTP_GENERATE === "true";
    const otp = isDynamic
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : process.env.DUMMY_OTP || "1234";

    // In a real application, you would send this OTP via SMS here.

    // Connect to DB and save OTP
    await connectToDatabase();

    // Upsert the OTP to ensure only the latest OTP exists per phone number
    await Otp.findOneAndUpdate(
      { phone },
      { phone, otp, createdAt: new Date() },
      { upsert: true, new: true }
    );
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to user",
      // otp, // Returning OTP for testing purposes
    });
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
