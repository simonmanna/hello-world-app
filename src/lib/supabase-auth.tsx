// File: lib/supabase-auth.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// This is the implementation of createRouteHandlerClient
export function createRouteHandlerClient<T>({
  cookies,
}: {
  cookies: () => any;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<T>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: cookies().toString(),
      },
    },
  });
}

// Helper function to get server-side Supabase client
export function getServerSupabase() {
  return createServerComponentClient<Database>({ cookies });
}
