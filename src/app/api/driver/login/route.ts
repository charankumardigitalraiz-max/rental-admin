import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Otp from "@/models/otp";
import Driver from "@/models/driver";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, fcmToken } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if driver exists
    const driver = await Driver.findOne({ phone });

    if (!driver) {
      return NextResponse.json(
        { success: false, message: "Invalid Credentials" },
        { status: 404 }
      );
    }

    if (fcmToken) {
      driver.fcmToken = fcmToken;
      await driver.save();
      try {
        const { subscribeTokensToTopic } = await import("@/lib/firebase-admin");
        await subscribeTokensToTopic([fcmToken], "drivers");
        await subscribeTokensToTopic([fcmToken], "all");
      } catch (err: any) {
        console.warn("Could not subscribe driver token on login:", err?.message);
      }
    }

    const isDriverVerified = driver.isVerified === true || ["verified", "approved", "active"].includes(driver.status);

    if (!isDriverVerified) {
      return NextResponse.json(
        { success: false, message: "Your account is not verified yet. Please contact admin." },
        { status: 403 }
      );
    }

    // Check if driver is verified
    const allowedStatuses = ["verified", "approve", "active", "verify"];
    if (!allowedStatuses.includes(driver.status)) {
      return NextResponse.json(
        { success: false, message: "Your account is currently inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Determine if we should generate a dynamic OTP or use the dummy one
    const isDynamic = process.env.OTP_GENERATE === "true";
    const otp = isDynamic
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : process.env.DUMMY_OTP || "1234";

    // In a real application, you would send this OTP via SMS here.

    // Upsert the OTP to ensure only the latest OTP exists per phone number
    await Otp.findOneAndUpdate(
      { phone },
      { phone, otp, createdAt: new Date() },
      { upsert: true, new: true }
    );
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to driver",
      // otp, // Returning OTP for testing purposes
    });
  } catch (error) {
    console.error("Driver login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
