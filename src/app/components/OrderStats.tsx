// /app/components/OrderStats.tsx
import { Order } from "../lib/types";
import { formatCurrency } from "../lib/utils";

interface OrderStatsProps {
  orders: Order[];
}

export default function OrderStats({ orders }: OrderStatsProps) {
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

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "ORDER_PLACED" ||
      order.status === "PREPARING" ||
      order.status === "READY_FOR_DELIVERY"
  );

  const deliveryOrders = orders.filter(
    (order) => order.status === "OUT_FOR_DELIVERY"
  );

  const stats = [
    { name: "Total Orders", value: orders.length },
    { name: "Today's Orders", value: todayOrders.length },
    { name: "Total Revenue", value: formatCurrency(totalRevenue) },
    { name: "Today's Revenue", value: formatCurrency(todayRevenue) },
    { name: "Pending Orders", value: pendingOrders.length },
    { name: "Out for Delivery", value: deliveryOrders.length },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((item) => (
        <div
          key={item.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {item.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {item.value}
              </dd>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
}
