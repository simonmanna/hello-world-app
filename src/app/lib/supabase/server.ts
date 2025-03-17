// lib/supabase/server.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Define the type for the Supabase database schema
export type Database = {
  public: {
    tables: {
      order_feedback: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          status: "active" | "inactive" | "deleted";
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          delivery_rating: number | null;
          food_quality_rating: number;
          service_rating: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          status?: "active" | "inactive" | "deleted";
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          delivery_rating?: number | null;
          food_quality_rating?: number;
          service_rating?: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          status?: "active" | "inactive" | "deleted";
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          delivery_rating?: number | null;
          food_quality_rating?: number;
          service_rating?: number;
        };
      };
    };
  };
};

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey);
};
