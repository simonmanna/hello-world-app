"use client";
// components/dashboard/Sidebar.tsx
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Settings,
  Users,
  BarChart,
  ChevronDown,
  ChevronRight,
  Utensils,
  ShoppingCart,
  Star,
  MessageSquare,
  UserCheck,
} from "lucide-react";

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Menu",
      href: "/categories",
      icon: <Utensils size={20} />,
      subItems: [
        { label: "Categories", href: "/categories" },
        { label: "All Menu", href: "/menu" },
        { label: "Popular", href: "/popular" },
        { label: "Addons", href: "/addons" },
        { label: "Choices", href: "/choices" },
        { label: "Options", href: "/menu-options" },
      ],
    },
    {
      label: "Orders",
      href: "/all-orders",
      icon: <ShoppingCart size={20} />,
      subItems: [
        { label: "All Orders", href: "/orders" },
        { label: "Pending", href: "/orders-pending" },
        { label: "Completed", href: "/orders-completed" },
      ],
    },
    // { label: "Menu", href: "/menu", icon: <ShoppingBag size={20} /> },
    { label: "Deliveries", href: "/deliveries", icon: <Truck size={20} /> },
    { label: "Invoices", href: "/invoices", icon: <Truck size={20} /> },
    { label: "Payments", href: "/payments", icon: <Truck size={20} /> },
    { label: "Rewards", href: "/rewards", icon: <Star size={20} /> },
    {
      label: "Feedbacks",
      href: "/order-feedback",
      icon: <MessageSquare size={20} />,
    },
    { label: "Drivers", href: "/drivers", icon: <UserCheck size={20} /> },
    {
      label: "Reports",
      href: "/all-reports",
      icon: <ShoppingCart size={20} />,
      subItems: [
        { label: "All Reports", href: "/reports/orders-report" },
        { label: "Invoices", href: "/invoices/reports" },
        { label: "Completed", href: "/orders/completed" },
      ],
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart size={20} />,
      subItems: [
        { label: "Sales", href: "/dashboard/analytics/sales" },
        { label: "Customer", href: "/dashboard/analytics/customer" },
        { label: "Performance", href: "/dashboard/analytics/performance" },
      ],
    },
    { label: "Users", href: "/dashboard/users", icon: <Users size={20} /> },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings size={20} />,
      subItems: [
        { label: "General", href: "/dashboard/settings" },
        { label: "Notifications", href: "/dashboard/settings/notifications" },
        { label: "Security", href: "/dashboard/settings/security" },
      ],
    },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r text-white border-gray-200 h-full overflow-y-auto">
      <div className="flex flex-col items-center justify-center py-4">
        <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
          <span className="text-2xl font-extrabold">AP</span>
        </div>
        <h1 className="text-xl font-bold text-center">AFROPARK Admin</h1>
      </div>
      <nav className="px-4 py-2">
        <ul>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.subItems &&
                item.subItems.some((subItem) => pathname === subItem.href));
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus[item.label];

            return (
              <li key={item.href} className="mb-2">
                {hasSubItems ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`flex items-center justify-between w-full p-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </div>
                      {isOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {isOpen && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href;

                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={`block p-2 rounded-md text-sm transition-colors ${
                                  isSubActive
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
