// /app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "Home" },
    { name: "Orders", href: "/orders", icon: "ShoppingBag" },
    { name: "Delivery Staff", href: "/delivery", icon: "Truck" },
    { name: "Settings", href: "/settings", icon: "Settings" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-800 text-white w-64 fixed">
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold">Restaurant Admin</h1>
      </div>
      <div className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-3 rounded-md ${
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-500"></div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
          </div>
        </div>
      </div>
    </div>
  );
}
