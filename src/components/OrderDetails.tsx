// /app/components/OrderDetails.tsx
"use client";

import { useState } from "react";
import { Order, OrderStatus, PaymentStatus } from "../lib/types";
import { formatCurrency, formatDate } from "../lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";
import {
  updateOrderStatus,
  updatePaymentStatus,
  assignDeliveryPerson,
} from "../lib/supabase";

interface OrderDetailsProps {
  order: Order;
  deliveryPersons: any[];
  onUpdateSuccess: () => void;
}

export default function OrderDetails({
  order,
  deliveryPersons,
  onUpdateSuccess,
}: OrderDetailsProps) {
  const [status, setStatus] = useState<OrderStatus | null>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    order.payment_status as PaymentStatus
  );
  const [deliveryPersonId, setDeliveryPersonId] = useState<number | null>(
    order.delivery_person_id
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, status);
      onUpdateSuccess();
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async () => {
    setIsUpdating(true);
    try {
      await updatePaymentStatus(order.id, paymentStatus);
      onUpdateSuccess();
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!deliveryPersonId) return;

    setIsUpdating(true);
    try {
      await assignDeliveryPerson(order.id, deliveryPersonId);
      onUpdateSuccess();
    } catch (error) {
      console.error("Failed to assign delivery person:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Details
          </h3>
          <div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Order ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.id}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(order.created_at)}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Customer Phone
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{order.phone_number}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatCurrency(order.total_amount, order.currency || "USD")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">
              Delivery Address
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {order.delivery_address}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Payment Method
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {order.payment_method || "N/A"}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Payment Status
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              <PaymentStatusBadge
                status={order.payment_status as PaymentStatus}
              />
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Delivery Method
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {order.delivery_method || "N/A"}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Delivery Fee</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatCurrency(order.delivery_amount, order.currency || "USD")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Order Note</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {order.order_note || "No notes"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
        <ul className="divide-y divide-gray-200">
          {order.order_items.map((item: any, index: number) => (
            <li key={index} className="py-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  {item.options && item.options.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Options:{" "}
                      {item.options
                        .map((opt: any) => `${opt.name}: ${opt.value}`)
                        .join(", ")}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-gray-500">Notes: {item.notes}</p>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(
                    item.price * item.quantity,
                    order.currency || "USD"
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-500">Subtotal</p>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(
                order.total_amount -
                  (order.delivery_amount || 0) -
                  (order.total_amount_vat || 0),
                order.currency || "USD"
              )}
            </p>
          </div>
          {order.delivery_amount && (
            <div className="flex justify-between mt-2">
              <p className="text-sm font-medium text-gray-500">Delivery Fee</p>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(order.delivery_amount, order.currency || "USD")}
              </p>
            </div>
          )}
          {order.total_amount_vat && order.total_amount_vat > 0 && (
            <div className="flex justify-between mt-2">
              <p className="text-sm font-medium text-gray-500">
                VAT ({order.vat}%)
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(
                  order.total_amount_vat,
                  order.currency || "USD"
                )}
              </p>
            </div>
          )}
          <div className="flex justify-between mt-2">
            <p className="text-sm font-bold text-gray-900">Total</p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(order.total_amount, order.currency || "USD")}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Update Order</h4>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Order Status
            </label>
            <div className="mt-1 flex">
              <select
                id="status"
                name="status"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={status || ""}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                type="button"
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleStatusChange}
                disabled={isUpdating}
              >
                Update
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="paymentStatus"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Status
            </label>
            <div className="mt-1 flex">
              <select
                id="paymentStatus"
                name="paymentStatus"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={paymentStatus || ""}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as PaymentStatus)
                }
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <button
                type="button"
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handlePaymentStatusChange}
                disabled={isUpdating}
              >
                Update
              </button>
            </div>
          </div>
          {(status === "READY_FOR_DELIVERY" || status === "ORDER_PLACED") && (
            <div className="sm:col-span-2">
              <label
                htmlFor="deliveryPerson"
                className="block text-sm font-medium text-gray-700"
              >
                Assign Delivery Person
              </label>
              <div className="mt-1 flex">
                <select
                  id="deliveryPerson"
                  name="deliveryPerson"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={deliveryPersonId || ""}
                  onChange={(e) => setDeliveryPersonId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    Select Delivery Person
                  </option>
                  {deliveryPersons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.status})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleAssignDelivery}
                  disabled={isUpdating || !deliveryPersonId}
                >
                  Assign & Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
