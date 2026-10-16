import { NextRequest, NextResponse } from "next/server";
import Admin from "@/models/admin";
import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { email, password, fcmToken } = body;
        const admin = await Admin.findOne({ email, status: true });
        if (!admin)
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 400 }
            );

        if (!bcrypt.compareSync(password, admin.password))
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 400 }
            );

        if (fcmToken) {
            admin.fcmToken = fcmToken;
            await admin.save();
            try {
                const { subscribeTokensToTopic } = await import("@/lib/firebase-admin");
                await subscribeTokensToTopic([fcmToken], "admin");
                await subscribeTokensToTopic([fcmToken], "all");
            } catch (err: any) {
                console.warn("Could not subscribe admin token on login:", err?.message);
            }
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "30d" }
        );

        const response = NextResponse.json({ success: true, token, data: admin }, { status: 200 });

        response.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 30 // 30 days in seconds
        });

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}