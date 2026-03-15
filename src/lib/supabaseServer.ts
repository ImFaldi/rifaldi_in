import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.types";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL (atau SUPABASE_URL) dan SUPABASE_SERVICE_ROLE_KEY di .env.local"
    );
  }

  return { url, key };
}

export function getSupabaseAdminClient() {
  const { url, key } = getSupabaseConfig();

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
