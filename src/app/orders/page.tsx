// /app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import OrderTable from "../components/OrderTable";
import { getOrders } from "../lib/supabase";
import { Order } from "../lib/types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await getOrders();
        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="flex">
      <div className="flex-1 p-2">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner">Loading...</div>
            </div>
          ) : (
            <OrderTable orders={orders} />
          )}
        </div>
      </div>
    </div>
  );
}
