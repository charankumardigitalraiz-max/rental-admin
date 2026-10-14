import { NextRequest, NextResponse } from "next/server";
import { getFirebaseStatus } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const status = getFirebaseStatus();

    return NextResponse.json({
      success: true,
      firebase: status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
