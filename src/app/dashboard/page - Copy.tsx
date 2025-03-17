"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import OrderStats from "../components/OrderStats";
import OrderTable from "../components/OrderTable";
import { getOrders } from "../lib/supabase";
import { Order } from "../lib/types";
import { Loader2, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await getOrders();
        if (error) {
          setError(error.message);
          console.error("Error fetching orders:", error);
        } else {
          setOrders(data || []);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching orders:", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div
            className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg flex items-center space-x-2"
            role="alert"
          >
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <OrderStats orders={orders} />
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Orders
              </h2>
              <OrderTable orders={orders.slice(0, 5)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
