// File: app/payments/page.tsx - Payments dashboard page
"use client";

import { useState, useEffect } from "react";

import { format } from "date-fns";
import Link from "next/link";
import {
  Calendar,
  Search,
  Filter,
  CreditCard,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  PlusCircle,
  FileText,
} from "lucide-react";
import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";
type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "mobile_payment"
  | "gift_card"
  | "other";

interface Customer {
  name: string;
}

interface Invoice {
  invoice_number: string;
  total_amount: number;
}

interface PaymentItem {
  id: string;
  amount: number;
  invoice_id: string;
  invoices?: Invoice;
}

interface Payment {
  id: string;
  payment_number: string;
  customer_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  payment_date: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  customers?: Customer;
  payment_items?: PaymentItem[];
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  startDate: string;
  endDate: string;
  customerId: string;
  status: string;
}

interface PaymentStats {
  totalPayments: number;
  completedAmount: number;
  pendingAmount: number;
}

export default function PaymentsDashboard() {
  //   const { supabase } = useSupabase();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    customerId: "",
    status: "",
  });
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    completedAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, [pagination.page, filters]);

  const fetchPayments = async (): Promise<void> => {
    setLoading(true);

    const { page, pageSize } = pagination;
    const { startDate, endDate, customerId, status } = filters;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("pageSize", pageSize.toString());
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (customerId) queryParams.append("customerId", customerId);
    if (status) queryParams.append("status", status);

    try {
      const response = await fetch(`/api/payments?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setPayments(data.payments);
        setPagination((prevState) => ({
          ...prevState,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        console.error("Error fetching payments:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async (): Promise<void> => {
    try {
      const { count: totalCount, error: countError } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true });

      const { data: completedPayments, error: completedError } = await supabase
        .from("payments")
        .select("amount_paid")
        .eq("payment_status", "completed");

      const { data: pendingPayments, error: pendingError } = await supabase
        .from("payments")
        .select("amount_paid")
        .eq("payment_status", "pending");

      if (
        !countError &&
        !completedError &&
        !pendingError &&
        completedPayments &&
        pendingPayments
      ) {
        const completedAmount = completedPayments.reduce(
          (sum, payment) => sum + parseFloat(payment.amount_paid.toString()),
          0
        );
        const pendingAmount = pendingPayments.reduce(
          (sum, payment) => sum + parseFloat(payment.amount_paid.toString()),
          0
        );

        setStats({
          totalPayments: totalCount || 0,
          completedAmount,
          pendingAmount,
        });
      }
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = (): void => {
    setFilters({
      startDate: "",
      endDate: "",
      customerId: "",
      status: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number): void => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusBadgeColor = (status: PaymentStatus): string => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
      partially_refunded: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Payments Dashboard
        </h1>
        <Link
          href="/payments/new"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Payment
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Payments</p>
              <h3 className="text-2xl font-bold">{stats.totalPayments}</h3>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Completed Payments</p>
              <h3 className="text-2xl font-bold">
                ${stats.completedAmount.toFixed(2)}
              </h3>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending Payments</p>
              <h3 className="text-2xl font-bold">
                ${stats.pendingAmount.toFixed(2)}
              </h3>
            </div>
            <CreditCard className="h-10 w-10 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-2">
          <Filter className="h-5 w-5 mr-2 text-gray-500" />
          <h3 className="font-medium">Filter Payments</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md pl-8"
              />
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md pl-8"
              />
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Payment Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially Refunded</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="flex items-center p-2 border text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <RefreshCcw className="h-4 w-4 mr-1" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/payments/${payment.id}`}>
                        {payment.payment_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.customers?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(payment.amount_paid.toString()).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payment_method.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          payment.payment_status
                        )}`}
                      >
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/payments/${payment.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/payments/${payment.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {payments.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page === pagination.totalPages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === 1
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNumber: number;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNumber = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNumber
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === pagination.totalPages
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
