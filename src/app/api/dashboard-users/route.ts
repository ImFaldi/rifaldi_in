import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireDashboardRole } from "@/lib/auth";

type DashboardUserItem = {
  id: string;
  email: string;
  role: "admin" | "editor";
  created_at: string;
  updated_at: string;
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

export async function GET(request: NextRequest) {
  const roleError = requireDashboardRole(request, "admin");
  if (roleError) return roleError;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("dashboard_users")
      .select("id, email, role, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json((data ?? []) as DashboardUserItem[]);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
