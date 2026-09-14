import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// For public, unauthenticated reads (product catalog, collections) from
// Server Components. Unlike lib/supabase/server.js this never touches
// cookies(), so pages that only need this stay statically generatable.
export function createPublicClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
