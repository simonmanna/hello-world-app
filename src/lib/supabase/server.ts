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
  //   NEXT_PUBLIC_SUPABASE_URL=https://mlpgrevfohpiaepnnsch.supabase.co
  // NEXT_PUBLIC_SUPABASE_ANON_KEY=  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scGdyZXZmb2hwaWFlcG5uc2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTcwOTgsImV4cCI6MjA0MjQ3MzA5OH0.pp4aRjxONzTfmNddHEcAua16qEjUeHlOEU3zNwJloOg

  const supabaseUrl = "https://mlpgrevfohpiaepnnsch.supabase.co";
  const supabaseServiceKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scGdyZXZmb2hwaWFlcG5uc2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTcwOTgsImV4cCI6MjA0MjQ3MzA5OH0.pp4aRjxONzTfmNddHEcAua16qEjUeHlOEU3zNwJloOg";

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey);
};
