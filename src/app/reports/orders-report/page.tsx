"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SearchIcon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
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
  phone_number: string;
  created_at: string;
  delivery_method: string | null;
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  currency: string | null;
}

interface ColumnFilter {
  id: keyof Order | "order_items";
  value: string;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

export default function OrdersReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<keyof Order>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Column filters
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Date Range filter
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: "",
    endDate: "",
  });

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

  // Helper function to check if a date is within range
  const isDateInRange = (
    dateStr: string,
    startDate: string,
    endDate: string
  ) => {
    if (!startDate && !endDate) return true;

    const date = new Date(dateStr);

    if (startDate && !endDate) {
      return date >= new Date(startDate);
    }

    if (!startDate && endDate) {
      return date <= new Date(endDate);
    }

    return date >= new Date(startDate) && date <= new Date(endDate);
  };

  // Filter orders based on global, column, and date range filters
  useEffect(() => {
    let result = [...orders];

    // Apply date range filter
    if (dateFilter.startDate || dateFilter.endDate) {
      result = result.filter((order) =>
        isDateInRange(
          order.created_at,
          dateFilter.startDate,
          dateFilter.endDate
        )
      );
    }

    // Apply global filter
    if (globalFilter) {
      const searchString = globalFilter.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(searchString) ||
          order.phone_number.toLowerCase().includes(searchString) ||
          order.status?.toLowerCase().includes(searchString) ||
          order.payment_method?.toLowerCase().includes(searchString) ||
          order.payment_status?.toLowerCase().includes(searchString) ||
          order.order_items.some((item) =>
            item.name.toLowerCase().includes(searchString)
          )
      );
    }

    // Apply column filters
    if (columnFilters.length > 0) {
      columnFilters.forEach((filter) => {
        if (filter.value) {
          const searchString = filter.value.toLowerCase();
          if (filter.id === "order_items") {
            result = result.filter((order) =>
              order.order_items.some((item) =>
                item.name.toLowerCase().includes(searchString)
              )
            );
          } else if (filter.id === "total_amount") {
            result = result.filter((order) =>
              order.total_amount.toString().includes(searchString)
            );
          } else if (filter.id === "created_at") {
            // Implement date filtering for the column filter
            result = result.filter((order) => {
              const orderDate = new Date(order.created_at).toLocaleDateString(
                "en-GB"
              );
              return orderDate.toLowerCase().includes(searchString);
            });
          } else {
            result = result.filter((order) => {
              const value = order[filter.id];
              return (
                value !== null &&
                value !== undefined &&
                value.toString().toLowerCase().includes(searchString)
              );
            });
          }
        }
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      // Handle null values
      if (fieldA === null && fieldB === null) return 0;
      if (fieldA === null) return 1;
      if (fieldB === null) return -1;

      // Special handling for dates
      if (sortField === "created_at") {
        const dateA = new Date(fieldA as string).getTime();
        const dateB = new Date(fieldB as string).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Compare based on field type
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }

      // For numbers
      return sortDirection === "asc"
        ? (fieldA as number) - (fieldB as number)
        : (fieldB as number) - (fieldA as number);
    });

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    globalFilter,
    columnFilters,
    orders,
    sortField,
    sortDirection,
    dateFilter,
  ]);

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

  // Handle column filter
  const handleColumnFilter = (
    id: keyof Order | "order_items",
    value: string
  ) => {
    setColumnFilters((prev) => {
      const existing = prev.find((filter) => filter.id === id);
      if (existing) {
        return prev.map((filter) =>
          filter.id === id ? { ...filter, value } : filter
        );
      } else {
        return [...prev, { id, value }];
      }
    });
  };

  // Handle date range change
  const handleDateRangeChange = (key: keyof DateFilter, value: string) => {
    setDateFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear date filters
  const clearDateFilters = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    });
  };

  // Pagination logic
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;

    // Create CSV string
    const headers = [
      "ID",
      "Date",
      "Items",
      "Total",
      "Phone",
      "Status",
      "Payment Method",
      "Payment Status",
    ];
    const rows = filteredOrders.map((order) => [
      order.id,
      new Date(order.created_at).toLocaleString("en-GB"),
      order.order_items
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", "),
      `${order.total_amount}`,
      order.phone_number,
      order.status,
      order.payment_method,
      order.payment_status,
    ]);

    // Add total row
    rows.push(["", "", "", `TOTAL: ${totalOrdersAmount}`, "", "", "", ""]);

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
      date: new Date(order.created_at).toLocaleDateString("en-GB"),
      id: order.id.substring(0, 8) + "...",
      status: order.status || "N/A",
      payment: order.payment_status || "N/A",
      total: `${order.total_amount} `,
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
      foot: [["", "", "", "TOTAL:", `${totalOrdersAmount}`]],
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

        {/* Date Range Filter */}
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-grow">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Date Range Filter
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      handleDateRangeChange("startDate", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      handleDateRangeChange("endDate", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearDateFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Clear Dates
              </button>
            </div>
          </div>
        </div>

        {/* Search and Export Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search all fields..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

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
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <div className="flex flex-col">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleSort("created_at")}
                      >
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Date
                        </span>
                        <span className="flex items-center">
                          {sortField === "created_at" &&
                            (sortDirection === "asc" ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            ))}
                        </span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Filter date..."
                          className="w-full p-1 text-xs border border-gray-200 rounded text-gray-100"
                          value={
                            columnFilters.find((f) => f.id === "created_at")
                              ?.value || ""
                          }
                          onChange={(e) =>
                            handleColumnFilter("created_at", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <div className="flex flex-col">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        <span>Order ID</span>
                        <span className="flex items-center">
                          {sortField === "id" &&
                            (sortDirection === "asc" ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            ))}
                        </span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Filter ID..."
                          className="w-full p-1 text-xs border border-gray-300 rounded text-gray-100"
                          value={
                            columnFilters.find((f) => f.id === "id")?.value ||
                            ""
                          }
                          onChange={(e) =>
                            handleColumnFilter("id", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span>Items</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Filter items..."
                          className="w-full p-1 text-xs border border-gray-300 rounded text-gray-100"
                          value={
                            columnFilters.find((f) => f.id === "order_items")
                              ?.value || ""
                          }
                          onChange={(e) =>
                            handleColumnFilter("order_items", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <div className="flex flex-col">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleSort("total_amount")}
                      >
                        <span>Total</span>
                        <span className="flex items-center">
                          {sortField === "total_amount" &&
                            (sortDirection === "asc" ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            ))}
                        </span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Filter amount..."
                          className="w-full p-1 text-xs border border-gray-300 rounded text-gray-100"
                          value={
                            columnFilters.find((f) => f.id === "total_amount")
                              ?.value || ""
                          }
                          onChange={(e) =>
                            handleColumnFilter("total_amount", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <div className="flex flex-col">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <span>Order Status</span>
                        <span className="flex items-center">
                          {sortField === "status" &&
                            (sortDirection === "asc" ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            ))}
                        </span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Filter status..."
                          className="w-full p-1 text-xs border border-gray-300 rounded text-gray-100"
                          value={
                            columnFilters.find((f) => f.id === "status")
                              ?.value || ""
                          }
                          onChange={(e) =>
                            handleColumnFilter("status", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <div className="flex flex-col">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleSort("payment_status")}
                      >
                        <span>Payment Status</span>
                        <span className="flex items-center">
                          {sortField === "payment_status" &&
                            (sortDirection === "asc" ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            ))}
                        </span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Filter payment..."
                          className="w-full p-1 text-xs border border-gray-300 rounded text-gray-100"
                          value={
                            columnFilters.find((f) => f.id === "payment_status")
                              ?.value || ""
                          }
                          onChange={(e) =>
                            handleColumnFilter("payment_status", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString("en-GB")}
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
                        {order.total_amount_vat.toLocaleString("en-GB")}
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
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
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * rowsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * rowsPerPage, filteredOrders.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate page numbers to show
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
