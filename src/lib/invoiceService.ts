// File: src/lib/invoiceService.ts
import { supabase } from "./supabase";
import {
  Invoice,
  InvoiceItem,
  InvoiceFilters,
  PaginatedInvoices,
  InvoiceWithItems,
} from "@/types/invoice";

export async function getInvoices({
  page = 1,
  limit = 10,
  search = "",
}: InvoiceFilters = {}): Promise<PaginatedInvoices> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("invoices")
    .select(
      `
      *,
      customers (id, name),
      employees:server_id (id, name)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `invoice_number.ilike.%${search}%,customers.name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    invoices: (data as Invoice[]) || [],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getInvoiceById(id: string): Promise<InvoiceWithItems> {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      customers (id, name, email, phone),
      employees:server_id (id, name)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select(
      `
      *,
      menu_items (id, name, description, price)
    `
    )
    .eq("invoice_id", id);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return { invoice: invoice as Invoice, items: (items as InvoiceItem[]) || [] };
}

export async function updateInvoice(
  id: string,
  invoiceData: Partial<Invoice> & { items?: Partial<InvoiceItem>[] }
): Promise<{ success: boolean }> {
  const { items, ...invoiceFields } = invoiceData;

  // Update invoice fields
  const { error: invoiceError } = await supabase
    .from("invoices")
    .update({
      ...invoiceFields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  // If there are items to update
  if (items && items.length > 0) {
    for (const item of items) {
      if (item.id) {
        // Update existing item
        const { error } = await supabase
          .from("invoice_items")
          .update({
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount,
            subtotal: item.subtotal,
            notes: item.notes,
          })
          .eq("id", item.id);

        if (error) throw new Error(error.message);
      } else {
        // Add new item
        const { error } = await supabase.from("invoice_items").insert({
          invoice_id: id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          subtotal: item.subtotal,
          notes: item.notes,
        });

        if (error) throw new Error(error.message);
      }
    }
  }

  return { success: true };
}

export async function createInvoice(
  invoiceData: Omit<Invoice, "id" | "created_at" | "updated_at"> & {
    items: Omit<InvoiceItem, "id" | "invoice_id">[];
  }
): Promise<{ id: string }> {
  const { items, ...invoiceFields } = invoiceData;

  // Create invoice
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      ...invoiceFields,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const invoiceId = data.id;

  // Create invoice items
  if (items && items.length > 0) {
    const itemsWithInvoiceId = items.map((item) => ({
      ...item,
      invoice_id: invoiceId,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }
  }

  return { id: invoiceId };
}

export async function deleteInvoiceItem(
  id: string
): Promise<{ success: boolean }> {
  const { error } = await supabase.from("invoice_items").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function deleteInvoice(id: string): Promise<{ success: boolean }> {
  // Delete invoice (invoice_items will be deleted via ON DELETE CASCADE)
  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getServers() {
  const { data, error } = await supabase
    .from("employees")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getMenuItems() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, price")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
