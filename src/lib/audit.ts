import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthTokenPayload } from "@/lib/auth";
import type { Database, Json } from "@/lib/supabase.types";

interface AuditParams {
  user: AuthTokenPayload;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Json;
}

export async function logDashboardAudit(
  client: SupabaseClient<Database>,
  params: AuditParams
): Promise<void> {
  const payload = {
    user_id: params.user.sub,
    user_email: params.user.email,
    user_role: params.user.role,
    action: params.action,
    resource: params.resource,
    resource_id: params.resourceId ?? null,
    metadata: params.metadata ?? {},
  };

  await client.from("dashboard_audit_logs").insert(payload);
}
