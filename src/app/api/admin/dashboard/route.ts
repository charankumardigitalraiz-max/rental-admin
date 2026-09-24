import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Token is valid, proceed with dashboard logic
        // In a real application, you might fetch analytics, user counts, etc. from the DB here
        
        return NextResponse.json({ 
            success: true, 
            message: "Welcome to the admin dashboard",
            user: admin
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
