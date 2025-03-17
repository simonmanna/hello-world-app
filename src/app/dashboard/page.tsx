"use client";
import { useEffect, useState } from "react";
import { getOrders } from "../lib/supabase";
import OrderTable from "../components/OrderTable";
import {
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * Order stats component to display metrics with improved styling
 * @param {object} props
 * @param {Array} props.orders
 */
function OrderStats({ orders }) {
  // Calculate metrics from orders
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total_amount_vat || 0),
    0
  );
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const metrics = [
    {
      name: "Total Orders",
      value: totalOrders,
      icon: <Package size={24} />,
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
      trend: "+12% from last month",
      trendUp: true,
    },
    {
      name: "Total Revenue",
      value: `UGX ${totalRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign size={24} />,
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
      trend: "+8.3% from last month",
      trendUp: true,
    },
    {
      name: "Completed Orders",
      value: completedOrders,
      icon: <CheckCircle size={24} />,
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
      trend: "+5% from last month",
      trendUp: true,
    },
    {
      name: "Pending Orders",
      value: pendingOrders,
      icon: <Clock size={24} />,
      color: "bg-amber-50 text-amber-600",
      iconBg: "bg-amber-100",
      trend: "-2% from last month",
      trendUp: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">{metric.name}</p>
              <p className="text-2xl mt-1 font-bold text-gray-800">
                {metric.value}
              </p>
              <div className="flex items-center mt-2">
                <span
                  className={`mr-1 ${
                    metric.trendUp ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {metric.trendUp ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  )}
                </span>
                <span
                  className={`text-xs ${
                    metric.trendUp ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {metric.trend}
                </span>
              </div>
            </div>
            <div
              className={`p-3 rounded-full ${metric.iconBg} ${metric.color}`}
            >
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Sales trend chart component
 */
function SalesTrendChart({ timeFrame }) {
  // Sample data - in real app, this would be fetched from an API
  const dailyData = [
    { name: "Mon", sales: 4000 },
    { name: "Tue", sales: 3000 },
    { name: "Wed", sales: 5000 },
    { name: "Thu", sales: 2780 },
    { name: "Fri", sales: 1890 },
    { name: "Sat", sales: 6390 },
    { name: "Sun", sales: 3490 },
  ];

  const weeklyData = [
    { name: "Week 1", sales: 24000 },
    { name: "Week 2", sales: 18000 },
    { name: "Week 3", sales: 32000 },
    { name: "Week 4", sales: 27000 },
  ];

  const monthlyData = [
    { name: "Jan", sales: 65000 },
    { name: "Feb", sales: 59000 },
    { name: "Mar", sales: 80000 },
    { name: "Apr", sales: 81000 },
    { name: "May", sales: 56000 },
    { name: "Jun", sales: 55000 },
    { name: "Jul", sales: 40000 },
  ];

  // Select data based on timeframe
  let data;
  let title;
  switch (timeFrame) {
    case "daily":
      data = dailyData;
      title = "Daily Sales";
      break;
    case "weekly":
      data = weeklyData;
      title = "Weekly Sales";
      break;
    case "monthly":
      data = monthlyData;
      title = "Monthly Sales";
      break;
    default:
      data = dailyData;
      title = "Daily Sales";
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <div className="text-green-500 flex items-center text-sm font-medium">
          <TrendingUp size={16} className="mr-1" />
          +12.5% growth
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [`UGX ${value.toLocaleString()}`, "Sales"]}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Payment Summary component
 */
function PaymentSummary() {
  // Sample data
  const paymentData = [
    { name: "Mobile Money", value: 65 },
    { name: "Bank Transfer", value: 20 },
    { name: "Cash", value: 10 },
    { name: "Credit Card", value: 5 },
  ];

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 mb-6">
        Payment Methods
      </h3>
      <div className="flex">
        <div className="w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2">
          <div className="space-y-4">
            {paymentData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Additional summary components
 */
function InvoiceSummary() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">Invoice Status</h3>
        <button className="text-blue-600 text-sm font-medium hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Invoices</span>
          <span className="font-medium">85</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Paid</span>
          <span className="font-medium text-green-600">62</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pending</span>
          <span className="font-medium text-amber-600">18</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Overdue</span>
          <span className="font-medium text-red-600">5</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="h-8 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div className="h-full bg-green-500 w-3/5"></div>
            <div className="h-full bg-amber-500 w-1/5"></div>
            <div className="h-full bg-red-500 w-1/12"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>73% Paid</span>
          <span>21% Pending</span>
          <span>6% Overdue</span>
        </div>
      </div>
    </div>
  );
}

function RewardsSummary() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">Customer Rewards</h3>
        <button className="text-blue-600 text-sm font-medium hover:underline">
          Manage Rewards
        </button>
      </div>

      <div className="space-y-4">
        {[
          {
            name: "Loyalty Points Issued",
            value: "12,580",
            icon: <Award size={18} />,
            color: "text-purple-600",
          },
          {
            name: "Points Redeemed",
            value: "4,230",
            icon: <ShoppingBag size={18} />,
            color: "text-amber-600",
          },
          {
            name: "Active Promotions",
            value: "7",
            icon: <TrendingUp size={18} />,
            color: "text-blue-600",
          },
          {
            name: "Top Customers",
            value: "25",
            icon: <Users size={18} />,
            color: "text-green-600",
          },
        ].map((item) => (
          <div key={item.name} className="flex items-center">
            <div className={`p-2 rounded-lg ${item.color} bg-opacity-10`}>
              {item.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{item.name}</p>
              <p className="text-lg font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Time frame selector component
 */
function TimeFrameSelector({ timeFrame, setTimeFrame }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-6">
      {["daily", "weekly", "monthly"].map((option) => (
        <button
          key={option}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeFrame === option
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setTimeFrame(option)}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}

/**
 * Main Dashboard component
 */
export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("daily");

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
    <div className="min-h-screen bg-gray-50">
      <main className="p-2">
        <div className="max-w-7xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin inline-block" />
                <p className="mt-4 text-gray-500">Loading dashboard data...</p>
              </div>
            </div>
          ) : error ? (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl flex items-center space-x-3"
              role="alert"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <span className="font-medium">Error loading dashboard:</span>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-700 mb-4">
                  Dashboard Overview
                </h2>
                <OrderStats orders={orders} />
              </div>

              <TimeFrameSelector
                timeFrame={timeFrame}
                setTimeFrame={setTimeFrame}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <SalesTrendChart timeFrame={timeFrame} />
                <PaymentSummary />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <InvoiceSummary />
                <RewardsSummary />
              </div>

              <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-medium text-gray-800">
                    Recent Orders
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing the last {Math.min(orders.length, 10)} orders from a
                    total of {orders.length}
                  </p>
                </div>
                <OrderTable orders={orders.slice(0, 6)} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
