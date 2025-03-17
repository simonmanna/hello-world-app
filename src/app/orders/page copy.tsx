import { supabase } from "@/lib/supabase";

export default async function OrdersPage() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_items, total_amount, status, delivery_address, phone_number, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
    return <p className="text-red-500">Failed to load orders</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {orders?.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="border p-4 rounded-lg shadow">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total Amount:</strong> ${order.total_amount}</p>
              <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
              <p><strong>Phone:</strong> {order.phone_number}</p>
              <p><strong>Ordered At:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">View Order Items</summary>
                <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(order.order_items, null, 2)}</pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
