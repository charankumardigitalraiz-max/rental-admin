import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function verifyAdmin(req: NextRequest) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    } catch (e) {
        return null;
    }
}
