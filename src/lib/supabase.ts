// /app/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { OrdersResponse, OrderResponse, Order } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getOrders(): Promise<OrdersResponse> {
  try {
    const { data, error } = await supabase.from("orders").select("*");
    // .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Supabase query error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error("Unknown error occurred"),
    };
  }
}

export async function getOrderById(id: string): Promise<OrderResponse> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<OrderResponse> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function updatePaymentStatus(
  id: string,
  payment_status: Order["payment_status"]
): Promise<OrderResponse> {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function getDeliveryPersons() {
  const { data, error } = await supabase.from("delivery_persons").select("*");

  return { data, error };
}

export async function assignDeliveryPerson(
  orderId: string,
  deliveryPersonId: number
): Promise<OrderResponse> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      delivery_person_id: deliveryPersonId,
      status: "OUT_FOR_DELIVERY",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  return { data, error };
}
