// /app/components/OrderTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Order } from "../lib/types";
import { formatCurrency, formatDate } from "../lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";

interface OrderTableProps {
  orders: Order[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filter !== "all" && order.status !== filter) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(term) ||
        order.phone_number.toLowerCase().includes(term) ||
        order.delivery_address.toLowerCase().includes(term)
      );
    }

    return true;
  });

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex justify-between items-center flex-wrap">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
          <div className="mt-2 flex space-x-2">
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="ORDER_PLACED">New Orders</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="text"
              placeholder="Search orders..."
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {order.id.substring(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{order.phone_number}</div>
                    <div className="text-xs text-gray-400">
                      {order.delivery_address.substring(0, 30)}
                      {order.delivery_address.length > 30 ? "..." : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(
                      order.total_amount,
                      order.currency || "UGX"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <PaymentStatusBadge
                      status={order.payment_status as PaymentStatus}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
