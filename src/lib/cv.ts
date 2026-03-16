import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.types";

export const CV_RESOURCES = ["experiences", "certifications", "projects"] as const;

export type CvResource = (typeof CV_RESOURCES)[number];
export type CvStatus = "draft" | "review" | "published";

export interface CvListOptions {
  includeDrafts?: boolean;
  includeDeleted?: boolean;
}

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
    "status",
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
    "status",
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
    "status",
  ],
};

const REQUIRED_FIELDS: Record<CvResource, readonly string[]> = {
  experiences: ["role", "company", "location", "period", "type", "description"],
  certifications: ["name", "issuer", "date", "credential_id"],
  projects: ["title", "description"],
};

function normalizeTags(input: unknown): string[] | undefined {
  if (input === undefined) return undefined;
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  return undefined;
}

function normalizeNullableString(input: unknown): string | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (typeof input === "string") return input.trim() || null;
  return undefined;
}

function normalizeRequiredString(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim();
  return value || undefined;
}

function normalizeStatus(input: unknown): CvStatus | undefined {
  if (typeof input !== "string") return undefined;
  if (input === "draft" || input === "review" || input === "published") return input;
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

    if (field === "status") {
      const status = normalizeStatus(payload[field]);
      if (status !== undefined) clean.status = status;
      continue;
    }

    if (["href", "repo", "title_en", "description_en"].includes(field)) {
      const value = normalizeNullableString(payload[field]);
      if (value !== undefined) clean[field] = value;
      continue;
    }

    const value = normalizeRequiredString(payload[field]);
    if (value !== undefined) clean[field] = value;
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

export function validateCvPayload<K extends CvResource>(
  resource: K,
  payload: Record<string, unknown>,
  mode: "insert" | "update"
): string[] {
  const errors: string[] = [];

  if (mode === "insert") {
    for (const field of REQUIRED_FIELDS[resource]) {
      if (typeof payload[field] !== "string" || !String(payload[field]).trim()) {
        errors.push(`Field '${field}' wajib diisi.`);
      }
    }
  }

  if (payload.status !== undefined && normalizeStatus(payload.status) === undefined) {
    errors.push("Field 'status' harus salah satu: draft, review, published.");
  }

  return errors;
}

export async function listCvResource<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K,
  options: CvListOptions = {}
) {
  const includeDrafts = options.includeDrafts ?? false;
  const includeDeleted = options.includeDeleted ?? false;

  switch (resource) {
    case "experiences": {
      let query = client.from("experiences").select("*");
      if (!includeDrafts) query = query.eq("status", "published");
      if (!includeDeleted) query = query.is("deleted_at", null);
      return query.order("updated_at", { ascending: false });
    }
    case "certifications": {
      let query = client.from("certifications").select("*");
      if (!includeDrafts) query = query.eq("status", "published");
      if (!includeDeleted) query = query.is("deleted_at", null);
      return query.order("updated_at", { ascending: false });
    }
    case "projects": {
      let query = client.from("projects").select("*");
      if (!includeDrafts) query = query.eq("status", "published");
      if (!includeDeleted) query = query.is("deleted_at", null);
      return query.order("updated_at", { ascending: false });
    }
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

export async function softDeleteCvResourceById<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K,
  id: string
) {
  const payload = { deleted_at: new Date().toISOString() };

  switch (resource) {
    case "experiences":
      return client.from("experiences").update(payload).eq("id", id);
    case "certifications":
      return client.from("certifications").update(payload).eq("id", id);
    case "projects":
      return client.from("projects").update(payload).eq("id", id);
  }
}

export async function restoreCvResourceById<K extends CvResource>(
  client: SupabaseClient<Database>,
  resource: K,
  id: string
) {
  const payload = { deleted_at: null };

  switch (resource) {
    case "experiences":
      return client.from("experiences").update(payload).eq("id", id).select("*").single();
    case "certifications":
      return client.from("certifications").update(payload).eq("id", id).select("*").single();
    case "projects":
      return client.from("projects").update(payload).eq("id", id).select("*").single();
  }
}
