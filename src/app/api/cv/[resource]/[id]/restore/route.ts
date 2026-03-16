import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { isCvResource, restoreCvResourceById } from "@/lib/cv";
import { getDashboardAuthPayload, requireDashboardRole } from "@/lib/auth";
import { logDashboardAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resource: string; id: string }> }
) {
  const authError = requireDashboardRole(request, "admin");
  if (authError) return authError;

  const authPayload = getDashboardAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Sesi login tidak valid." }, { status: 401 });
  }

  const { resource, id } = await context.params;

  if (!isCvResource(resource)) {
    return NextResponse.json({ message: "Resource tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await restoreCvResourceById(supabase, resource, id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    await logDashboardAudit(supabase, {
      user: authPayload,
      action: "restore",
      resource,
      resourceId: id,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
