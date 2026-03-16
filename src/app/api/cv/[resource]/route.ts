import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { insertCvResource, isCvResource, listCvResource, sanitizeInsertPayload } from "@/lib/cv";
import { requireDashboardAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;

  if (!isCvResource(resource)) {
    return NextResponse.json({ message: "Resource tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await listCvResource(supabase, resource);

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

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await insertCvResource(supabase, resource, cleanPayload);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
