import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "storytime_auth";

export async function GET() {
  // Client calls this on mount to check if already authenticated
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const gateKey = process.env.APP_GATE_KEY;

  if (!gateKey) {
    return NextResponse.json({ error: "Gate not configured" }, { status: 500 });
  }

  if (!password || password.trim() !== gateKey.trim()) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, gateKey.trim(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return response;
}
