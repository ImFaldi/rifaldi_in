import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  createAuthToken,
  normalizeEmail,
  validateAuthPayload,
  verifyPassword,
} from "@/lib/auth";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/authConstants";

type DashboardUser = {
  id: string;
  email: string;
  role: "admin" | "editor";
  password_hash: string;
};

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL (atau SUPABASE_URL) dan SUPABASE_SERVICE_ROLE_KEY di .env.local"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };

  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  const validationError = validateAuthPayload(email, password);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    const { data: userData, error } = await supabase
      .from("dashboard_users")
      .select("id, email, role, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ message: "Email belum terdaftar." }, { status: 401 });
    }

    const user = userData as DashboardUser;

    const passwordValid = verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json({ message: "Password salah." }, { status: 401 });
    }

    const token = createAuthToken(user.id, user.email, user.role);
    const response = NextResponse.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
