import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "storytime_auth";
const PUBLIC_PATHS = ["/api/gate"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith("/api")) return NextResponse.next();

  // Allow the gate endpoint itself through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const gateKey = process.env.APP_GATE_KEY;

  if (!gateKey || cookie !== gateKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
