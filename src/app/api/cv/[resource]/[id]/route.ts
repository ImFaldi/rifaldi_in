import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import {
  getCvResourceById,
  isCvResource,
  softDeleteCvResourceById,
  sanitizeUpdatePayload,
  updateCvResourceById,
  validateCvPayload,
} from "@/lib/cv";
import { getDashboardAuthPayload, requireDashboardAuth, requireDashboardRole } from "@/lib/auth";
import { logDashboardAudit } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ resource: string; id: string }> }
) {
  const { resource, id } = await context.params;

  if (!isCvResource(resource)) {
    return NextResponse.json({ message: "Resource tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await getCvResourceById(supabase, resource, id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ resource: string; id: string }> }
) {
  const authError = requireDashboardAuth(request);
  if (authError) return authError;

  const authPayload = getDashboardAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Sesi login tidak valid." }, { status: 401 });
  }

  const { resource, id } = await context.params;

  if (!isCvResource(resource)) {
    return NextResponse.json({ message: "Resource tidak valid." }, { status: 400 });
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
  }

  const cleanPayload = sanitizeUpdatePayload(resource, payload);
  const validationErrors = validateCvPayload(resource, cleanPayload, "update");

  if (validationErrors.length) {
    return NextResponse.json({ message: validationErrors.join(" ") }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await updateCvResourceById(supabase, resource, id, cleanPayload);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    await logDashboardAudit(supabase, {
      user: authPayload,
      action: "update",
      resource,
      resourceId: id,
      metadata: { payload: cleanPayload },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { error } = await softDeleteCvResourceById(supabase, resource, id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    await logDashboardAudit(supabase, {
      user: authPayload,
      action: "soft_delete",
      resource,
      resourceId: id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
