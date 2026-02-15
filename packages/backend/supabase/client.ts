import { createClient } from "@supabase/supabase-js";
import { keys, requireEnv } from "../keys";

const env = keys();

export const createSupabaseBrowserClient = () =>
  createClient(
    requireEnv(env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
  );
