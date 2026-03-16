import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import {
  insertCvResource,
  isCvResource,
  listCvResource,
  sanitizeInsertPayload,
  validateCvPayload,
} from "@/lib/cv";
import { getDashboardAuthPayload, requireDashboardAuth } from "@/lib/auth";
import { logDashboardAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;

  if (!isCvResource(resource)) {
    return NextResponse.json({ message: "Resource tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const authPayload = getDashboardAuthPayload(request);
    const includeDraftsParam = request.nextUrl.searchParams.get("includeDrafts") === "true";
    const includeDeletedParam = request.nextUrl.searchParams.get("includeDeleted") === "true";

    const includeDrafts = authPayload ? includeDraftsParam : false;
    const includeDeleted = authPayload ? includeDeletedParam : false;

    const { data, error } = await listCvResource(supabase, resource, {
      includeDrafts,
      includeDeleted,
    });

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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const authError = requireDashboardAuth(request);
  if (authError) return authError;

  const authPayload = getDashboardAuthPayload(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Sesi login tidak valid." }, { status: 401 });
  }

  const { resource } = await context.params;

  if (!isCvResource(resource)) {
    return NextResponse.json({ message: "Resource tidak valid." }, { status: 400 });
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
  }

  const cleanPayload = sanitizeInsertPayload(resource, payload);
  const validationErrors = validateCvPayload(resource, cleanPayload, "insert");

  if (validationErrors.length) {
    return NextResponse.json({ message: validationErrors.join(" ") }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await insertCvResource(supabase, resource, cleanPayload);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    await logDashboardAudit(supabase, {
      user: authPayload,
      action: "create",
      resource,
      resourceId: data?.id,
      metadata: { payload: cleanPayload },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
