// /app/lib/utils.ts
import { Order, OrderStatus, PaymentStatus } from "./types";

export function formatCurrency(
  amount: number | null,
  currency: string = "USD"
): string {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: OrderStatus | null): string {
  switch (status) {
    case "ORDER_PLACED":
      return "bg-blue-100 text-blue-800";
    case "PREPARING":
      return "bg-yellow-100 text-yellow-800";
    case "READY_FOR_DELIVERY":
      return "bg-purple-100 text-purple-800";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-100 text-orange-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPaymentStatusColor(status: PaymentStatus | null): string {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function calculateOrderStats(orders: Order[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(
    (order) => new Date(order.created_at) >= today
  );

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total_amount || 0),
    0
  );
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total_amount || 0),
    0
  );

  const statusCounts = orders.reduce((acc, order) => {
    const status = order.status || "UNKNOWN";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    totalRevenue,
    todayRevenue,
    statusCounts,
  };
}
