import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/customer";
import Notification from "@/models/notification";
import { verifyUser } from "@/lib/auth";
import { subscribeTokensToTopic } from "@/lib/firebase-admin";

/**
 * GET /api/user/notifications
 * Fetch notifications intended for this customer (or general/all broadcast notifications).
 */
export async function GET(request: NextRequest) {
  try {
    const userPayload: any = verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const notifications = await Notification.find({
      targetAudience: { $in: ["Customers", "All"] },
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
    console.error("User notifications fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/notifications/token
 * Register device FCM Push Token for the customer.
 */
export async function POST(request: NextRequest) {
  try {
    const userPayload: any = verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token" },
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

    await Customer.findByIdAndUpdate(userPayload.id, {
      $set: { fcmToken: token },
    });

    try {
      await subscribeTokensToTopic([token], "customers");
      await subscribeTokensToTopic([token], "all");
    } catch (err: any) {
      console.warn("Could not subscribe customer token to topics:", err?.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer FCM push token registered successfully",
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error registering customer FCM token:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
