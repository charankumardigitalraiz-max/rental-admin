import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import Customer from "@/models/customer";
import Admin from "@/models/admin";
import { subscribeTokensToTopic } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { token, role, identifier } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: "FCM token is required" }, { status: 400 });
    }

    // Role can be 'driver', 'customer', or 'admin'
    if (role === 'driver' && identifier) {
      await Driver.findOneAndUpdate(
        { $or: [{ _id: identifier }, { driverId: identifier }, { email: identifier }] },
        { $set: { fcmToken: token } }
      );
      try {
        await subscribeTokensToTopic([token], 'drivers');
        await subscribeTokensToTopic([token], 'all');
      } catch (err: any) {
        console.warn('Could not subscribe driver to topic:', err.message);
      }
    } else if (role === 'customer' && identifier) {
      await Customer.findOneAndUpdate(
        { $or: [{ _id: identifier }, { custId: identifier }, { email: identifier }] },
        { $set: { fcmToken: token } }
      );
      try {
        await subscribeTokensToTopic([token], 'customers');
        await subscribeTokensToTopic([token], 'all');
      } catch (err: any) {
        console.warn('Could not subscribe customer to topic:', err.message);
      }
    } else if (role === 'admin' && identifier) {
      await Admin.findOneAndUpdate(
        { $or: [{ _id: identifier }, { username: identifier }, { email: identifier }] },
        { $set: { fcmToken: token } }
      );
      try {
        await subscribeTokensToTopic([token], 'admin');
        await subscribeTokensToTopic([token], 'all');
      } catch (err: any) {
        console.warn('Could not subscribe admin to topic:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Device FCM token registered successfully",
      token,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/notifications/token:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register FCM token" },
      { status: 500 }
    );
  }
}
