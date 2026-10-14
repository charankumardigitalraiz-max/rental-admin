import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function verifyAdmin(req: NextRequest | Request) {
    let token: string | null = null;

    // 1. Check Authorization header (Bearer <token>)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    // 2. Check cookies
    if (!token && 'cookies' in req && typeof (req as any).cookies?.get === 'function') {
        token = (req as NextRequest).cookies.get("admin_token")?.value || null;
    }
    if (!token) {
        const cookieHeader = req.headers.get("cookie");
        if (cookieHeader) {
            const match = cookieHeader.match(/(?:^|;\s*)(?:admin_token|token)=([^;]+)/);
            if (match) token = decodeURIComponent(match[1]);
        }
    }
    if (!token) return null;
    try {
        const secret = process.env.JWT_SECRET || "fallback_secret";
        return jwt.verify(token, secret);
    } catch (e: any) {
        if (e.name === "TokenExpiredError") {
            console.warn("verifyAdmin: Admin token has expired at", e.expiredAt);
        } else {
            console.error("verifyAdmin: Verification failed:", e.message);
        }
        return null;
    }
}

export function verifyUser(req: NextRequest | Request) {
    // 1. Try to get token from Authorization header (Bearer <token>)
    const authHeader = req.headers.get("authorization");
    let token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    // 2. Fallback to cookies if no Auth header was provided
    if (!token) {
        if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
            token = (req as NextRequest).cookies.get("token")?.value
                || (req as NextRequest).cookies.get("user_token")?.value
                || null;
        }

        // 3. Fallback: Parse Cookie header string (e.g. from standard Request / Hoppscotch / Postman)
        if (!token) {
            const cookieHeader = req.headers.get("cookie");
            if (cookieHeader) {
                const match = cookieHeader.match(/(?:^|;\s*)(?:token|user_token)=([^;]+)/);
                if (match) {
                    token = decodeURIComponent(match[1]);
                }
            }
        }
    }

    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET || "fallback");
    } catch (e) {
        console.error("User JWT verification failed:", e);
        return null;
    }
}

export function verifyDriver(req: NextRequest | Request) {
    const authHeader = req.headers.get("authorization");
    let token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
            token = (req as NextRequest).cookies.get("driver_token")?.value
                || (req as NextRequest).cookies.get("token")?.value
                || null;
        }

        if (!token) {
            const cookieHeader = req.headers.get("cookie");
            if (cookieHeader) {
                const match = cookieHeader.match(/(?:^|;\s*)(?:driver_token|token)=([^;]+)/);
                if (match) {
                    token = decodeURIComponent(match[1]);
                }
            }
        }
    }

    if (!token) return null;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "fallback");
        return decoded;
    } catch (e) {
        console.error("Driver JWT verification failed:", e);
        return null;
    }
}


