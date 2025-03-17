// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { SearchIcon, DownloadIcon, FileTextIcon } from "lucide-react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_items: OrderItem[];
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  created_at: string;
  delivery_method: string | null;
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  currency: string | null;
}

export default function OrdersReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Order>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching orders...");

        // Option 1: Use the API route
        const response = await fetch("/api/orders");
        console.log("API response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.length} orders`);

        // Ensure order_items is properly formatted
        const processedData = data.map((order) => ({
          ...order,
          order_items: Array.isArray(order.order_items)
            ? order.order_items
            : [],
        }));

        setOrders(processedData);
        setFilteredOrders(processedData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = orders.filter((order) => {
      const searchString = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchString) ||
        order.delivery_address.toLowerCase().includes(searchString) ||
        order.phone_number.toLowerCase().includes(searchString) ||
        order.status?.toLowerCase().includes(searchString) ||
        order.payment_method?.toLowerCase().includes(searchString) ||
        order.payment_status?.toLowerCase().includes(searchString)
      );
    });

    // Sort filtered orders
    const sorted = [...filtered].sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      // Handle null values
      if (fieldA === null && fieldB === null) return 0;
      if (fieldA === null) return 1;
      if (fieldB === null) return -1;

      // Compare based on field type
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }

      // For numbers and dates
      return sortDirection === "asc"
        ? fieldA < fieldB
          ? -1
          : 1
        : fieldB < fieldA
        ? -1
        : 1;
    });

    setFilteredOrders(sorted);
  }, [searchTerm, orders, sortField, sortDirection]);

  // Calculate total from filtered orders
  const totalOrdersAmount = filteredOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );

  // Handle sort
  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;

    // Create CSV string
    const headers = [
      "ID",
      "Date",
      "Items",
      "Total",
      "Address",
      "Phone",
      "Status",
      "Payment Method",
      "Payment Status",
    ];
    const rows = filteredOrders.map((order) => [
      order.id,
      new Date(order.created_at).toLocaleString(),
      order.order_items
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", "),
      `${order.total_amount} ${order.currency || ""}`,
      order.delivery_address,
      order.phone_number,
      order.status,
      order.payment_method,
      order.payment_status,
    ]);

    // Add total row
    rows.push([
      "",
      "",
      "",
      `TOTAL: ${totalOrdersAmount} ${filteredOrders[0]?.currency || ""}`,
      "",
      "",
      "",
      "",
      "",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell || ""}"`).join(",")),
    ].join("\n");

    // Create and download blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `orders_report_${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (filteredOrders.length === 0) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Restaurant Orders Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Define table columns
    const columns = [
      { header: "Date", dataKey: "date" },
      { header: "ID", dataKey: "id" },
      { header: "Status", dataKey: "status" },
      { header: "Payment", dataKey: "payment" },
      { header: "Total", dataKey: "total" },
    ];

    // Prepare table data
    const data = filteredOrders.map((order) => ({
      date: new Date(order.created_at).toLocaleDateString(),
      id: order.id.substring(0, 8) + "...",
      status: order.status || "N/A",
      payment: order.payment_status || "N/A",
      total: `${order.total_amount} ${order.currency || ""}`,
    }));

    // Generate table
    (doc as any).autoTable({
      head: [columns.map((col) => col.header)],
      body: data.map((row) =>
        columns.map((col) => row[col.dataKey as keyof typeof row])
      ),
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [66, 66, 66] },
      foot: [
        [
          "",
          "",
          "",
          "TOTAL:",
          `${totalOrdersAmount} ${filteredOrders[0]?.currency || ""}`,
        ],
      ],
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    // Save PDF
    doc.save(`orders_report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <p>Please check your API connection or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Restaurant Orders Report
        </h1>

        {/* Search and Export Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID, address, status..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileTextIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("created_at")}
                  >
                    Date{" "}
                    {sortField === "created_at" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("id")}
                  >
                    Order ID{" "}
                    {sortField === "id" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("total_amount")}
                  >
                    Total{" "}
                    {sortField === "total_amount" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("status")}
                  >
                    Status{" "}
                    {sortField === "status" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("payment_status")}
                  >
                    Payment{" "}
                    {sortField === "payment_status" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {order.order_items
                          .map((item, i) => (
                            <div key={i} className="truncate">
                              {item.name} x{item.quantity}
                            </div>
                          ))
                          .slice(0, 2)}
                        {order.order_items.length > 2 && (
                          <div className="text-gray-400">
                            + {order.order_items.length - 2} more
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {order.total_amount} {order.currency || ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {order.delivery_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "ORDER_PLACED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "IN_TRANSIT"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.payment_status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : order.payment_status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.payment_status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.payment_status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No orders found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                  >
                    Total ({filteredOrders.length} orders):
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {totalOrdersAmount.toFixed(2)}{" "}
                    {filteredOrders[0]?.currency || ""}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
