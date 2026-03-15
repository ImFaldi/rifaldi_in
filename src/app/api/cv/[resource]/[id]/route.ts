import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import {
  deleteCvResourceById,
  getCvResourceById,
  isCvResource,
  sanitizeUpdatePayload,
  updateCvResourceById,
} from "@/lib/cv";

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

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await updateCvResourceById(supabase, resource, id, cleanPayload);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ resource: string; id: string }> }
) {
  const { resource, id } = await context.params;

  if (!isCvResource(resource)) {
    return NextResponse.json({ message: "Resource tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await deleteCvResourceById(supabase, resource, id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
