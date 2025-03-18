// lib/supabase-types.ts
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
      categories: {
        Row: {
          id: number;
          created_at: string;
          name: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
        };
        Relationships: [];
      };
      menus: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          description: string | null;
          imageUrl: string | null;
          price: number | null;
          category_id: number | null;
          is_popular: number | null;
          view_order: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          description?: string | null;
          imageUrl?: string | null;
          price?: number | null;
          category_id?: number | null;
          is_popular?: number | null;
          view_order?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          description?: string | null;
          imageUrl?: string | null;
          price?: number | null;
          category_id?: number | null;
          is_popular?: number | null;
          view_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "menus_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
