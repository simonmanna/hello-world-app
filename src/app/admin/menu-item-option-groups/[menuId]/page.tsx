// app/admin/menu-item-option-groups/[menuId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  category_id: number | null;
  is_popular: number | null;
  view_order: number | null;
};

type OptionGroup = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean | null;
};

type MenuItemOptionGroup = {
  menu_item_id: number;
  option_group_id: string;
  option_group?: OptionGroup;
};

export default function MenuItemOptionGroupsPage({
  params,
}: {
  params: { menuId: string };
}) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const menuId = parseInt(unwrappedParams.menuId);
  const router = useRouter();

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [menuItemOptionGroups, setMenuItemOptionGroups] = useState<
    MenuItemOptionGroup[]
  >([]);
  const [availableOptionGroups, setAvailableOptionGroups] = useState<
    OptionGroup[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOptionGroupIds, setSelectedOptionGroupIds] = useState<
    string[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [menuId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch menu item details
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .select("*")
        .eq("id", menuId)
        .single();

      if (menuError) throw menuError;
      setMenuItem(menuData as MenuItem);

      // Fetch all option groups
      const { data: optionGroupsData, error: optionGroupsError } =
        await supabase.from("menu_option_groups").select("*").order("name");

      if (optionGroupsError) throw optionGroupsError;
      setOptionGroups(optionGroupsData as OptionGroup[]);

      // Fetch existing menu item option groups with details
      const { data: menuOptionGroupsData, error: menuOptionGroupsError } =
        await supabase
          .from("menu_item_option_groups")
          .select(
            `
          *,
          option_group:menu_option_groups(*)
        `
          )
          .eq("menu_item_id", menuId);

      if (menuOptionGroupsError) throw menuOptionGroupsError;
      setMenuItemOptionGroups(menuOptionGroupsData as MenuItemOptionGroup[]);

      // Determine available option groups (those not already linked)
      const linkedOptionGroupIds = menuOptionGroupsData.map(
        (item: any) => item.option_group_id
      );
      const availableOptionGroupsList = optionGroupsData.filter(
        (group: OptionGroup) => !linkedOptionGroupIds.includes(group.id)
      );
      setAvailableOptionGroups(availableOptionGroupsList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleOptionGroupSelection = (id: string) => {
    setSelectedOptionGroupIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((groupId) => groupId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddOptionGroups = async () => {
    if (selectedOptionGroupIds.length === 0) return;

    try {
      const newLinks = selectedOptionGroupIds.map((groupId) => ({
        menu_item_id: menuId,
        option_group_id: groupId,
      }));

      const { error } = await supabase
        .from("menu_item_option_groups")
        .insert(newLinks);

      if (error) throw error;

      setShowAddModal(false);
      setSelectedOptionGroupIds([]);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteOptionGroup = async (optionGroupId: string) => {
    try {
      const { error } = await supabase
        .from("menu_item_option_groups")
        .delete()
        .eq("menu_item_id", menuId)
        .eq("option_group_id", optionGroupId);

      if (error) throw error;

      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredAvailableOptionGroups = availableOptionGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-red-500 font-bold text-lg">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => router.push("/admin/menus")}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  if (!menuItem)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-red-500 font-bold text-lg">
            Menu Item Not Found
          </h3>
          <button
            onClick={() => router.push("/admin/menus")}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin/menus"
              className="text-purple-500 hover:text-purple-700 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Menu Items
            </Link>
            <h1 className="text-2xl font-bold mt-2">
              Manage Option Groups for {menuItem.name}
            </h1>
            <p className="text-gray-600">{menuItem.description}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={availableOptionGroups.length === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-md shadow hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Option Groups
            </button>
          </div>
        </div>

        {/* Menu item details card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white">
              {menuItem.imageUrl ? (
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={menuItem.imageUrl}
                    alt={menuItem.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="h-48 mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <h2 className="text-xl font-bold">{menuItem.name}</h2>
              <p className="text-purple-100">${menuItem.price.toFixed(2)}</p>
            </div>

            <div className="md:w-3/4 p-6">
              <h3 className="text-lg font-semibold mb-4">
                Linked Option Groups
              </h3>

              {menuItemOptionGroups.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No option groups linked to this menu item yet.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    disabled={availableOptionGroups.length === 0}
                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add your first option group
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItemOptionGroups.map((item) => (
                    <div
                      key={item.option_group_id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-3 border-b flex justify-between items-center">
                        <h4 className="font-medium text-purple-800">
                          {item.option_group?.name}
                        </h4>
                        {item.option_group?.is_active ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        {item.option_group?.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {item.option_group?.description}
                          </p>
                        )}
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to remove "${item.option_group?.name}" from this menu item?`
                                )
                              ) {
                                handleDeleteOptionGroup(item.option_group_id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Option Groups Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                Add Option Groups
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Search Option Groups
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-md mb-4">
                {filteredAvailableOptionGroups.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No option groups available
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredAvailableOptionGroups.map((group) => (
                      <li key={group.id} className="p-2 hover:bg-gray-50">
                        <label className="flex items-center space-x-3 w-full cursor-pointer p-2">
                          <input
                            type="checkbox"
                            checked={selectedOptionGroupIds.includes(group.id)}
                            onChange={() =>
                              toggleOptionGroupSelection(group.id)
                            }
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{group.name}</p>
                            {group.description && (
                              <p className="text-sm text-gray-500 truncate">
                                {group.description}
                              </p>
                            )}
                          </div>
                          {group.is_active ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Inactive
                            </span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {selectedOptionGroupIds.length} option groups selected
                </span>
                {selectedOptionGroupIds.length > 0 && (
                  <button
                    onClick={() => setSelectedOptionGroupIds([])}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedOptionGroupIds([]);
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddOptionGroups}
                  disabled={selectedOptionGroupIds.length === 0}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Selected Groups
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
