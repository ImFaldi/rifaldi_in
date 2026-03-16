import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  createAuthToken,
  getDashboardAuthPayload,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/authConstants";

type ProfileUpdatePayload = {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

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

function validateProfilePayload(payload: ProfileUpdatePayload): string | null {
  const nextEmail = payload.email?.trim();
  const nextPassword = payload.newPassword ?? "";
  const currentPassword = payload.currentPassword ?? "";

  if (!nextEmail && !nextPassword) {
    return "Tidak ada perubahan yang dikirim.";
  }

  if (nextEmail) {
    const normalized = normalizeEmail(nextEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      return "Format email tidak valid.";
    }
  }

  if (nextPassword && nextPassword.length < 8) {
    return "Password baru minimal 8 karakter.";
  }

  if (!currentPassword) {
    return "Password saat ini wajib diisi untuk verifikasi.";
  }

  return null;
}

export async function PATCH(request: NextRequest) {
  const authPayload = getDashboardAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Sesi login tidak valid." }, { status: 401 });
  }

  let body: ProfileUpdatePayload;

  try {
    body = (await request.json()) as ProfileUpdatePayload;
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
  }

  const validationError = validateProfilePayload(body);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const nextEmail = body.email ? normalizeEmail(body.email) : null;
  const nextPassword = body.newPassword ?? "";
  const currentPassword = body.currentPassword ?? "";

  try {
    const supabase = getSupabaseAdminClient();

    const { data: meData, error: meError } = await supabase
      .from("dashboard_users")
      .select("id, email, role, password_hash")
      .eq("id", authPayload.sub)
      .maybeSingle();

    if (meError) {
      return NextResponse.json({ message: meError.message }, { status: 500 });
    }

    if (!meData) {
      return NextResponse.json({ message: "Akun tidak ditemukan." }, { status: 404 });
    }

    const me = meData as DashboardUser;

    if (!verifyPassword(currentPassword, me.password_hash)) {
      return NextResponse.json({ message: "Password saat ini salah." }, { status: 401 });
    }

    if (nextEmail && nextEmail !== me.email) {
      const { data: existing, error: existingError } = await supabase
        .from("dashboard_users")
        .select("id")
        .eq("email", nextEmail)
        .neq("id", me.id)
        .maybeSingle();

      if (existingError) {
        return NextResponse.json({ message: existingError.message }, { status: 500 });
      }

      if (existing) {
        return NextResponse.json({ message: "Email sudah dipakai akun lain." }, { status: 409 });
      }
    }

    const updatePayload: { email?: string; password_hash?: string } = {};

    if (nextEmail && nextEmail !== me.email) {
      updatePayload.email = nextEmail;
    }

    if (nextPassword) {
      updatePayload.password_hash = hashPassword(nextPassword);
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: "Tidak ada perubahan profil." }, { status: 200 });
    }

    const { data: updatedData, error: updateError } = await supabase
      .from("dashboard_users")
      .update(updatePayload)
      .eq("id", me.id)
      .select("id, email, role")
      .single();

    if (updateError || !updatedData) {
      return NextResponse.json(
        { message: updateError?.message ?? "Gagal memperbarui profil." },
        { status: 500 }
      );
    }

    const updatedUser = updatedData as Omit<DashboardUser, "password_hash">;
    const token = createAuthToken(updatedUser.id, updatedUser.email, updatedUser.role);

    const response = NextResponse.json({
      message: "Profil berhasil diperbarui.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
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
