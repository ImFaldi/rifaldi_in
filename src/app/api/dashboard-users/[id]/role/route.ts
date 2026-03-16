import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getDashboardAuthPayload, requireDashboardRole } from "@/lib/auth";
import { logDashboardAudit } from "@/lib/audit";

type RolePayload = {
  role?: "admin" | "editor";
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const roleError = requireDashboardRole(request, "admin");
  if (roleError) return roleError;

  const authPayload = getDashboardAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Sesi login tidak valid." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "ID user tidak valid." }, { status: 400 });
  }

  let body: RolePayload;

  try {
    body = (await request.json()) as RolePayload;
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
  }

  if (body.role !== "admin" && body.role !== "editor") {
    return NextResponse.json({ message: "Role harus admin atau editor." }, { status: 400 });
  }

  if (authPayload.sub === id && body.role === "editor") {
    return NextResponse.json(
      { message: "Tidak bisa menurunkan role akun sendiri." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdminClient();

    const { data: user, error: userError } = await supabase
      .from("dashboard_users")
      .select("id, email, role")
      .eq("id", id)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ message: userError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
    }

    if (user.role === "admin" && body.role === "editor") {
      const { count, error: countError } = await supabase
        .from("dashboard_users")
        .select("id", { head: true, count: "exact" })
        .eq("role", "admin");

      if (countError) {
        return NextResponse.json({ message: countError.message }, { status: 500 });
      }

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { message: "Harus ada minimal 1 admin aktif." },
          { status: 400 }
        );
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("dashboard_users")
      .update({ role: body.role })
      .eq("id", id)
      .select("id, email, role")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { message: updateError?.message ?? "Gagal memperbarui role user." },
        { status: 500 }
      );
    }

    await logDashboardAudit(supabase, {
      user: authPayload,
      action: "update_role",
      resource: "dashboard_users",
      resourceId: id,
      metadata: {
        target_email: updated.email,
        previous_role: user.role,
        next_role: updated.role,
      },
    });

    return NextResponse.json({
      message: "Role user berhasil diperbarui.",
      user: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
