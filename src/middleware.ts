import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const method = request.method;
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent") || "unknown-agent";
  const origin = request.headers.get("origin") || request.headers.get("referer") || "unknown-origin";
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "local";

  console.log(`[REQUEST] ${method} ${path} | IP: ${ip} | Origin: ${origin} | UA: ${userAgent}`);

  return NextResponse.next();
}

export const config = {
  // Apply middleware globally to all API routes
  matcher: ["/api/:path*"],
};
