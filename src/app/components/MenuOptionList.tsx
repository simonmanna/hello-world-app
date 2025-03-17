// components/MenuOptionList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuOption } from "@/lib/supabaseClient";

type MenuOptionListProps = {
  initialMenuOptions: MenuOption[];
};

export default function MenuOptionList({
  initialMenuOptions,
}: MenuOptionListProps) {
  const [menuOptions] = useState<MenuOption[]>(initialMenuOptions);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredOptions = menuOptions.filter((option) => {
    if (filter === "active") return option.is_active;
    if (filter === "inactive") return !option.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 rounded-md ${
              filter === "active" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-3 py-1 rounded-md ${
              filter === "inactive" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Inactive
          </button>
        </div>
        <Link
          href="/menu-options/new"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Add New Option
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price Adj.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No menu options found
                </td>
              </tr>
            ) : (
              filteredOptions.map((option) => (
                <tr key={option.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/menu-options/${option.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {option.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {option.description ? (
                      option.description.length > 50 ? (
                        `${option.description.substring(0, 50)}...`
                      ) : (
                        option.description
                      )
                    ) : (
                      <span className="text-gray-400">No description</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${option.price_adjustment?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        option.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {option.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/menu-options/${option.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
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
    </div>
  );
}
