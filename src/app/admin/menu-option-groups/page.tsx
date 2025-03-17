// app/admin/menu-option-groups/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type MenuOptionGroup = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export default function MenuOptionGroups() {
  const [optionGroups, setOptionGroups] = useState<MenuOptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptionGroups();
  }, []);

  async function fetchOptionGroups() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_option_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOptionGroups(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActiveStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("menu_option_groups")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      // Refresh the list
      fetchOptionGroups();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteOptionGroup(id: string) {
    try {
      // First delete all relationships in the junction table
      const { error: junctionError } = await supabase
        .from("menu_option_group_options")
        .delete()
        .eq("option_group_id", id);

      if (junctionError) throw junctionError;

      // Then delete the option group
      const { error } = await supabase
        .from("menu_option_groups")
        .delete()
        .eq("id", id);

      if (error) throw error;
      // Refresh the list
      fetchOptionGroups();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading)
    return <div className="text-center p-4">Loading option groups...</div>;
  if (error)
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Option Groups</h1>
        <Link
          href="/admin/menu-option-groups/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Option Group
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {optionGroups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No option groups found
                </td>
              </tr>
            ) : (
              optionGroups.map((group) => (
                <tr key={group.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{group.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {group.description || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        group.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {group.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(group.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/menu-option-groups/${group.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        toggleActiveStatus(group.id, group.is_active)
                      }
                      className={`${
                        group.is_active
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      } mr-4`}
                    >
                      {group.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this option group?"
                          )
                        ) {
                          deleteOptionGroup(group.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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
