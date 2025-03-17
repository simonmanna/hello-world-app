// File: src/types/supabase.ts
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
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string | null;
          table_number: number | null;
          server_id: string | null;
          created_at: string;
          updated_at: string;
          status: string;
          subtotal: number;
          tax_amount: number;
          tip_amount: number;
          discount_amount: number;
          total_amount: number;
          payment_method: string | null;
          payment_date: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_id?: string | null;
          table_number?: number | null;
          server_id?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          subtotal: number;
          tax_amount: number;
          tip_amount?: number;
          discount_amount?: number;
          total_amount: number;
          payment_method?: string | null;
          payment_date?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_id?: string | null;
          table_number?: number | null;
          server_id?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          subtotal?: number;
          tax_amount?: number;
          tip_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          payment_method?: string | null;
          payment_date?: string | null;
          notes?: string | null;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          menu_item_id: string | null;
          quantity: number;
          unit_price: number;
          discount_amount: number;
          subtotal: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          menu_item_id?: string | null;
          quantity: number;
          unit_price: number;
          discount_amount?: number;
          subtotal: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          menu_item_id?: string | null;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          subtotal?: number;
          notes?: string | null;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
        };
      };
      employees: {
        Row: {
          id: string;
          name: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
        };
      };
    };
  };
}

// File: src/types/invoice.ts
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Employee {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface InvoiceItem {
  id?: string;
  invoice_id: string;
  menu_item_id?: string;
  menu_items?: MenuItem;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id?: string;
  customers?: Customer;
  table_number?: number;
  server_id?: string;
  employees?: Employee;
  created_at: string;
  updated_at: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  subtotal: number;
  tax_amount: number;
  tip_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: string;
  payment_date?: string;
  notes?: string;
}

export interface PaginatedInvoices {
  invoices: Invoice[];
  count: number;
  totalPages: number;
}

export interface InvoiceWithItems {
  invoice: Invoice;
  items: InvoiceItem[];
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  search?: string;
}
