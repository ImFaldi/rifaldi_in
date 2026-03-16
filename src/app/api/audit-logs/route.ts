import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { requireDashboardAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireDashboardAuth(request);
  if (authError) return authError;

  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("dashboard_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
