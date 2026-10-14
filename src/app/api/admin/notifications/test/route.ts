import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import {
  sendPushNotification,
  sendTopicNotification,
  getFirebaseStatus,
} from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const fbStatus = getFirebaseStatus();
    if (!fbStatus.configured) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin is not properly configured.",
          details: fbStatus,
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const testToken = body.token;
    const testTopic = body.topic || "test-channel";

    const title = body.title || "🔔 Firebase Test Notification";
    const message =
      body.message ||
      `Test message dispatched from Admin Portal at ${new Date().toLocaleTimeString()}`;

    let result;
    if (testToken) {
      // Send directly to device token
      result = await sendPushNotification({
        token: testToken,
        title,
        body: message,
        data: {
          type: "Test",
          timestamp: new Date().toISOString(),
          source: "admin-test-tool",
        },
      });
    } else {
      // Send to topic
      result = await sendTopicNotification({
        topic: testTopic,
        title,
        body: message,
        data: {
          type: "Test",
          timestamp: new Date().toISOString(),
          source: "admin-test-tool",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: testToken
        ? "Test push notification successfully sent to device token!"
        : `Test push notification successfully dispatched to topic '${testTopic}'!`,
      fcmMessageId: result,
      target: testToken ? `Token: ${testToken.substring(0, 15)}...` : `Topic: ${testTopic}`,
      firebase: fbStatus,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/notifications/test:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test push notification",
        code: error.code,
      },
      { status: 500 }
    );
  }
}
