import { NextRequest, NextResponse } from "next/server";
import Admin from "@/models/admin";
import connectToDatabase from "@/lib/mongodb";
import { verifyAdmin } from "@/lib/auth";
import { unsubscribeTokensFromTopic } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json().catch(() => ({}));
    const { email, fcmToken } = body;

    const adminPayload: any = verifyAdmin(req);
    let admin = null;

    if (adminPayload?.id) {
      admin = await Admin.findById(adminPayload.id);
    } else if (email) {
      admin = await Admin.findOne({ email });
    } else if (fcmToken) {
      admin = await Admin.findOne({ fcmToken });
    }

    if (admin) {
      const tokenToRemove = admin.fcmToken || fcmToken;
      admin.fcmToken = "";
      await admin.save();

      if (tokenToRemove) {
        try {
          await unsubscribeTokensFromTopic([tokenToRemove], "admin");
          await unsubscribeTokensFromTopic([tokenToRemove], "all");
        } catch (unsubErr: any) {
          console.warn("Could not unsubscribe admin token on logout:", unsubErr?.message);
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin logged out and FCM token cleared successfully",
    });

    // Clear admin session cookie
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error("Error in POST /api/admin/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to logout" },
      { status: 500 }
    );
  }
}
