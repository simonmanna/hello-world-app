// /app/components/StatusBadge.tsx
import { OrderStatus, PaymentStatus } from "../lib/types";
import { getStatusColor, getPaymentStatusColor } from "../lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus | null;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
        status
      )}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus | null;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getPaymentStatusColor(
        status
      )}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}
