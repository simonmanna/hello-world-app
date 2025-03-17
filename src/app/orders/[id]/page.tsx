// /app/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import OrderDetails from "../../components/OrderDetails";
import { getOrderById, getDeliveryPersons } from "../../lib/supabase";
import { Order } from "../../lib/types";

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderRes, deliveryRes] = await Promise.all([
          getOrderById(params.id),
          getDeliveryPersons(),
        ]);

        if (orderRes.error) throw orderRes.error;
        if (deliveryRes.error) throw deliveryRes.error;

        setOrder(orderRes.data);
        setDeliveryPersons(deliveryRes.data || []);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const handleUpdateSuccess = async () => {
    try {
      const { data, error } = await getOrderById(params.id);
      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error refreshing order data:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Order Details
          </h1>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner">Loading...</div>
            </div>
          ) : order ? (
            <OrderDetails
              order={order}
              deliveryPersons={deliveryPersons}
              onUpdateSuccess={handleUpdateSuccess}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-700">Order not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
