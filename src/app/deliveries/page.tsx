"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Truck,
  X,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    delivered: 0,
    failed: 0,
  });

  // Fetch deliveries from Supabase
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("deliveries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setDeliveries(data || []);

        // Calculate statistics
        const newStats = {
          total: data.length,
          pending: data.filter((d) => d.status === "pending").length,
          in_progress: data.filter((d) => d.status === "in_progress").length,
          delivered: data.filter((d) => d.status === "delivered").length,
          failed: data.filter((d) => d.status === "failed").length,
        };
        setStats(newStats);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();

    // Set up a subscription for real-time updates
    const subscription = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
        },
        () => {
          fetchDeliveries();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get status icon based on delivery status
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "in_progress":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get human-readable status
  const getStatusText = (status) => {
    return (
      {
        pending: "Pending",
        in_progress: "In Progress",
        delivered: "Delivered",
        failed: "Failed",
      }[status] || status
    );
  };

  // Calculate distance between driver and customer (simplified)
  const calculateDistance = (delivery) => {
    if (!delivery.driver_lat || !delivery.driver_lng) return "N/A";

    // Simple distance calculation (not accurate for real-world usage)
    const latDiff = delivery.driver_lat - delivery.customer_lat;
    const lngDiff = delivery.driver_lng - delivery.customer_lng;

    // Simplified distance in miles (not accurate for real geographic calculations)
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // rough miles conversion

    return distance.toFixed(1) + " mi";
  };

  // Update delivery status
  const updateDeliveryStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("deliveries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating delivery status:", error);
      setError(error.message);
    }
  };

  // Assign driver to delivery
  const assignDriver = async (id, driverId) => {
    try {
      const { error } = await supabase
        .from("deliveries")
        .update({
          driver_id: driverId,
          status: "in_progress",
        })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error assigning driver:", error);
      setError(error.message);
    }
  };

  // Filter deliveries by status
  const filteredDeliveries =
    statusFilter === "all"
      ? deliveries
      : deliveries.filter((delivery) => delivery.status === statusFilter);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Tracking Dashboard</h1>

        {/* Summary Stats - Now in the header */}
        <div className="mt-2 md:mt-0 grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="bg-blue-50 p-2 rounded text-center">
            <div className="text-sm font-medium">Total</div>
            <div className="text-lg font-bold">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded text-center">
            <div className="text-sm font-medium">Pending</div>
            <div className="text-lg font-bold">{stats.pending}</div>
          </div>
          <div className="bg-blue-50 p-2 rounded text-center">
            <div className="text-sm font-medium">In Progress</div>
            <div className="text-lg font-bold">{stats.in_progress}</div>
          </div>
          <div className="bg-green-50 p-2 rounded text-center">
            <div className="text-sm font-medium">Delivered</div>
            <div className="text-lg font-bold">{stats.delivered}</div>
          </div>
          <div className="bg-red-50 p-2 rounded text-center">
            <div className="text-sm font-medium">Failed</div>
            <div className="text-lg font-bold">{stats.failed}</div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded ${
              statusFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded ${
              statusFilter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`px-4 py-2 rounded ${
              statusFilter === "in_progress"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`px-4 py-2 rounded ${
              statusFilter === "delivered"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter("failed")}
            className={`px-4 py-2 rounded ${
              statusFilter === "failed"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <p>Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading deliveries...</p>
        </div>
      ) : (
        /* Deliveries List */
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Order Time</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Driver</th>
                <th className="py-3 px-4 text-left">Distance</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      {formatDate(delivery.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(delivery.status)}
                        <span className="ml-2">
                          {getStatusText(delivery.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">
                        {delivery.order_id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {delivery.driver_id ? (
                        <span className="font-mono text-sm">
                          {delivery.driver_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">{calculateDistance(delivery)}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          title="View on map"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                        {delivery.status === "pending" && (
                          <button
                            className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            onClick={() =>
                              assignDriver(
                                delivery.id,
                                "00000000-0000-0000-0000-000000000000"
                              )
                            } // Replace with actual driver selection
                            title="Assign driver"
                          >
                            <Truck className="h-4 w-4" />
                          </button>
                        )}
                        {delivery.status === "in_progress" && (
                          <button
                            className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            onClick={() =>
                              updateDeliveryStatus(delivery.id, "delivered")
                            }
                            title="Mark as delivered"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No deliveries found with the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
