// /app/lib/types.ts
export type OrderStatus =
  | "ORDER_PLACED"
  | "PREPARING"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MOBILE_PAYMENT"
  | "ONLINE";

export type DeliveryMethod = "PICKUP" | "DELIVERY";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  options?: Record<string, any>[];
}

export interface Order {
  id: string;
  order_items: OrderItem[];
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  created_at: string;
  delivery_method: DeliveryMethod | null;
  delivery_amount: number | null;
  status: OrderStatus | null;
  delivery_person_id: number | null;
  user_id: string | null;
  updated_at: string | null;
  payment_method: PaymentMethod | null;
  total_amount_vat: number | null;
  vat: number | null;
  order_feedback: string | null;
  order_note: string | null;
  delivery_location: any | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  tracking_id: string | null;
  payment_status: PaymentStatus | null;
  transaction_id: string | null;
  currency: string | null;
  payment_tracking_id: string | null;
  payment_failure_reason: string | null;
  payment_confirmed_at: string | null;
  payment_details: string | null;
  reward_points: number | null;
}

export interface OrdersResponse {
  data: Order[] | null;
  error: Error | null;
}

export interface OrderResponse {
  data: Order | null;
  error: Error | null;
}

export interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
}
