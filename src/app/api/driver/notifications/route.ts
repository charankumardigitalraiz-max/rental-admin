import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import Notification from "@/models/notification";
import { verifyDriver } from "@/lib/auth";
import { subscribeTokensToTopic } from "@/lib/firebase-admin";

/**
 * GET /api/driver/notifications
 * Fetch notifications intended for this driver (or general/all broadcast notifications).
 */
export async function GET(request: NextRequest) {
  try {
    const driverPayload: any = verifyDriver(request);
    if (!driverPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing driver token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const notifications = await Notification.find({
      targetAudience: { $in: ["Drivers", "All"] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: notifications.length,
        data: notifications,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Driver notifications fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/driver/notifications/token
 * Register device FCM Push Token for the driver.
 */
export async function POST(request: NextRequest) {
  try {
    const driverPayload: any = verifyDriver(request);
    if (!driverPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing driver token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "FCM token is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await Driver.findByIdAndUpdate(driverPayload.id, {
      $set: { fcmToken: token },
    });

    try {
      await subscribeTokensToTopic([token], "drivers");
      await subscribeTokensToTopic([token], "all");
    } catch (err: any) {
      console.warn("Could not subscribe driver token to topics:", err?.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Driver FCM push token registered successfully",
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error registering driver FCM token:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
