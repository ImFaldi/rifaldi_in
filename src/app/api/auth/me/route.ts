import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieFromRequest, verifyAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = getAuthCookieFromRequest(request);

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    },
  });
}
