// lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      menu_options: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_adjustment: number | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_adjustment?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price_adjustment?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
    };
  };
}
