// Now let's create the pages
// app/addons/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Addon } from "@/types/addon";

export default function AddonsList() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const response = await fetch("/api/addons");

        if (!response.ok) {
          throw new Error("Failed to fetch addons");
        }

        const data = await response.json();
        setAddons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAddons();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Addons</h1>
        <Link
          href="/addons/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New
        </Link>
      </div>

      {addons.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          No addons found. Create your first one!
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {addons.map((addon) => (
                <tr key={addon.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {addon.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {addon.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${addon.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        addon.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {addon.is_available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/addons/${addon.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      href={`/addons/${addon.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
