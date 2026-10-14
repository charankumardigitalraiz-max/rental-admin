import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/notification";
import { verifyAdmin } from "@/lib/auth";
import { dispatchNotification } from "@/lib/notifications";
import { getFirebaseStatus } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const query: any = {};

    const search = url.searchParams.get("search");
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { targetAudience: { $regex: search, $options: "i" } },
      ];
    }

    const audience = url.searchParams.get("audience");
    if (audience && audience !== "All") {
      query.targetAudience = audience;
    }

    const type = url.searchParams.get("type");
    if (type && type !== "All") {
      query.type = type;
    }

    const status = url.searchParams.get("status");
    if (status && status !== "All") {
      query.status = status;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const totalAll = await Notification.countDocuments();
    const sentCount = await Notification.countDocuments({ status: "sent" });
    const failedCount = await Notification.countDocuments({ status: "failed" });
    const unreadCount = await Notification.countDocuments({ read: false });

    // Firebase status
    const firebase = getFirebaseStatus();

    return NextResponse.json({
      success: true,
      data: notifications,
      firebase,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        total: totalAll,
        sent: sentCount,
        failed: failedCount,
        unread: unreadCount,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, targetAudience, targetType, topic, token, tokens, type, imageUrl, data } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title and message are required" },
        { status: 400 }
      );
    }

    const adminName = (admin as any).name || (admin as any).username || 'Admin';

    const result = await dispatchNotification({
      title,
      message,
      targetAudience: targetAudience || 'All',
      targetType: targetType || (token ? 'token' : 'topic'),
      topic,
      token,
      tokens,
      type: type || 'General',
      imageUrl,
      data,
      sentBy: adminName,
    });

    return NextResponse.json({
      success: result.success,
      data: result.record,
      fcmMessageId: result.fcmMessageId,
      error: result.error,
      firebaseConfigured: result.firebaseConfigured,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    if (body.markAll) {
      await Notification.updateMany({ read: false }, { $set: { read: true } });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (body.id) {
      await Notification.findByIdAndUpdate(body.id, { $set: { read: true } });
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 });
    }

    await Notification.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}
