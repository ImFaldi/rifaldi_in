import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/authConstants";

export async function POST() {
  const response = NextResponse.json({ message: "Logout berhasil." });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
