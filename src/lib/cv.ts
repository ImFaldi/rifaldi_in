import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.types";

export const CV_RESOURCES = ["experiences", "certifications", "projects"] as const;

export type CvResource = (typeof CV_RESOURCES)[number];

type InsertMap = {
  [K in CvResource]: Database["public"]["Tables"][K]["Insert"];
};

type UpdateMap = {
  [K in CvResource]: Database["public"]["Tables"][K]["Update"];
};

const ALLOWED_FIELDS: Record<CvResource, readonly string[]> = {
  experiences: [
    "role",
    "company",
    "location",
    "period",
    "type",
    "description",
    "description_en",
    "tags",
  ],
  certifications: [
    "name",
    "issuer",
    "date",
    "credential_id",
    "badge",
    "gradient",
    "hover_border",
    "href",
  ],
  projects: [
    "title",
    "title_en",
    "description",
    "description_en",
    "tags",
    "href",
    "repo",
    "gradient",
  ],
};

function normalizeTags(input: unknown): string[] | undefined {
  if (input === undefined) return undefined;
  if (Array.isArray(input)) {
    return input.filter((item): item is string => typeof item === "string");
  }
  return undefined;
}

function normalizeNullableString(input: unknown): string | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (typeof input === "string") return input.trim() || null;
  return undefined;
}

export function isCvResource(value: string): value is CvResource {
  return (CV_RESOURCES as readonly string[]).includes(value);
}

export function sanitizeInsertPayload<K extends CvResource>(
  resource: K,
  payload: Record<string, unknown>
): InsertMap[K] {
  const clean: Record<string, unknown> = {};

  for (const field of ALLOWED_FIELDS[resource]) {
    if (field === "tags") {
      const tags = normalizeTags(payload[field]);
      if (tags !== undefined) clean.tags = tags;
      continue;
    }

    if (["href", "repo", "title_en", "description_en"].includes(field)) {
      const value = normalizeNullableString(payload[field]);
      if (value !== undefined) clean[field] = value;
      continue;
    }

    const value = payload[field];
    if (typeof value === "string") {
      clean[field] = value;
    }
  }

  return clean as InsertMap[K];
}

export function sanitizeUpdatePayload<K extends CvResource>(
  resource: K,
  payload: Record<string, unknown>
): UpdateMap[K] {
  const clean = sanitizeInsertPayload(resource, payload);
  return clean as UpdateMap[K];
}

export async function listCvResource<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K
) {
  switch (resource) {
    case "experiences":
      return client.from("experiences").select("*").order("created_at", { ascending: false });
    case "certifications":
      return client.from("certifications").select("*").order("created_at", { ascending: false });
    case "projects":
      return client.from("projects").select("*").order("created_at", { ascending: false });
  }
}

export async function insertCvResource<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K,
  payload: InsertMap[K]
) {
  switch (resource) {
    case "experiences":
      return client.from("experiences").insert(payload as InsertMap["experiences"]).select("*").single();
    case "certifications":
      return client.from("certifications").insert(payload as InsertMap["certifications"]).select("*").single();
    case "projects":
      return client.from("projects").insert(payload as InsertMap["projects"]).select("*").single();
  }
}

export async function getCvResourceById<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K,
  id: string
) {
  switch (resource) {
    case "experiences":
      return client.from("experiences").select("*").eq("id", id).single();
    case "certifications":
      return client.from("certifications").select("*").eq("id", id).single();
    case "projects":
      return client.from("projects").select("*").eq("id", id).single();
  }
}

export async function updateCvResourceById<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K,
  id: string,
  payload: UpdateMap[K]
) {
  switch (resource) {
    case "experiences":
      return client
        .from("experiences")
        .update(payload as UpdateMap["experiences"])
        .eq("id", id)
        .select("*")
        .single();
    case "certifications":
      return client
        .from("certifications")
        .update(payload as UpdateMap["certifications"])
        .eq("id", id)
        .select("*")
        .single();
    case "projects":
      return client
        .from("projects")
        .update(payload as UpdateMap["projects"])
        .eq("id", id)
        .select("*")
        .single();
  }
}

export async function deleteCvResourceById<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K,
  id: string
) {
  switch (resource) {
    case "experiences":
      return client.from("experiences").delete().eq("id", id);
    case "certifications":
      return client.from("certifications").delete().eq("id", id);
    case "projects":
      return client.from("projects").delete().eq("id", id);
  }
}
