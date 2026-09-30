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

export function verifyUser(req: NextRequest | Request) {
    // 1. Try to get token from Authorization header (Bearer <token>)
    const authHeader = req.headers.get("authorization");
    let token = authHeader && authHeader.startsWith("Bearer ") 
        ? authHeader.split(" ")[1] 
        : null;

    // 2. Fallback to cookies if it's a NextRequest and no Auth header was provided
    if (!token && 'cookies' in req) {
        token = (req as NextRequest).cookies.get("token")?.value 
             || (req as NextRequest).cookies.get("user_token")?.value 
             || null;
    }

    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET || "fallback");
    } catch (e) {
        return null;
    }
}
