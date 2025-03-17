// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Define types based on your table structure
export type MenuOption = {
  id: string;
  name: string;
  description: string | null;
  price_adjustment: number | null;
  is_active: boolean | null;
  created_at: string | null;
};
