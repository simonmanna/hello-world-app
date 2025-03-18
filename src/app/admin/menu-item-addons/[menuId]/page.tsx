// app/admin/menu-item-addons/[menuId]/page.tsx
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
};

type Addon = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
};

type MenuItemAddon = {
  id: string;
  menu_item_id: number;
  addon_id: string;
  is_default: boolean;
  is_required: boolean;
  max_quantity: number;
  addon?: Addon;
};

export default function MenuItemAddonsPage({
  params,
}: {
  params: { menuId: string };
}) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const menuId = parseInt(unwrappedParams.menuId);
  const router = useRouter();

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [menuItemAddons, setMenuItemAddons] = useState<MenuItemAddon[]>([]);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddonId, setSelectedAddonId] = useState<string>("");
  const [editingAddon, setEditingAddon] = useState<MenuItemAddon | null>(null);

  // Form state for new or editing addon
  const [formState, setFormState] = useState({
    is_default: false,
    is_required: false,
    max_quantity: 1,
  });

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

      // Fetch all addons
      const { data: addonsData, error: addonsError } = await supabase
        .from("addons")
        .select("*")
        .order("name");

      if (addonsError) throw addonsError;
      setAddons(addonsData as Addon[]);

      // Fetch existing menu item addons with addon details
      const { data: menuAddonsData, error: menuAddonsError } = await supabase
        .from("menu_item_addons")
        .select(
          `
          *,
          addon:addons(*)
        `
        )
        .eq("menu_item_id", menuId);

      if (menuAddonsError) throw menuAddonsError;
      setMenuItemAddons(menuAddonsData as MenuItemAddon[]);

      // Determine available addons (those not already linked)
      const linkedAddonIds = menuAddonsData.map((item: any) => item.addon_id);
      const availableAddonsList = addonsData.filter(
        (addon: Addon) => !linkedAddonIds.includes(addon.id)
      );
      setAvailableAddons(availableAddonsList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormState((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      // Ensure the value is never empty; default to 1 if empty
      const numValue = value === "" ? 1 : parseInt(value);
      setFormState((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openEditModal = (menuItemAddon: MenuItemAddon) => {
    setEditingAddon(menuItemAddon);
    setFormState({
      is_default: menuItemAddon.is_default || false,
      is_required: menuItemAddon.is_required || false,
      max_quantity: menuItemAddon.max_quantity || 1,
    });
  };

  const resetFormState = () => {
    setFormState({
      is_default: false,
      is_required: false,
      max_quantity: 1,
    });
    setSelectedAddonId("");
    setEditingAddon(null);
  };

  const handleAddAddon = async () => {
    if (!selectedAddonId) return;

    try {
      const { error } = await supabase.from("menu_item_addons").insert({
        menu_item_id: menuId,
        addon_id: selectedAddonId,
        is_default: formState.is_default,
        is_required: formState.is_required,
        max_quantity: formState.max_quantity,
      });

      if (error) throw error;

      setShowAddModal(false);
      resetFormState();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateAddon = async () => {
    if (!editingAddon) return;

    // Ensure max_quantity is at least 1
    const maxQuantity = formState.max_quantity < 1 ? 1 : formState.max_quantity;

    try {
      const { error } = await supabase
        .from("menu_item_addons")
        .update({
          is_default: formState.is_default,
          is_required: formState.is_required,
          max_quantity: maxQuantity,
        })
        .eq("id", editingAddon.id);

      if (error) throw error;

      setEditingAddon(null);
      resetFormState();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAddon = async (id: string) => {
    try {
      const { error } = await supabase
        .from("menu_item_addons")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
              className="text-blue-500 hover:text-blue-700 flex items-center"
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
              Manage Addons for {menuItem.name}
            </h1>
            <p className="text-gray-600">{menuItem.description}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={availableAddons.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
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
              Add Addon
            </button>
          </div>
        </div>

        {/* Menu item details card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
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
              <p className="text-blue-100">${menuItem.price.toFixed(2)}</p>
            </div>

            <div className="md:w-3/4 p-6">
              <h3 className="text-lg font-semibold mb-4">Linked Addons</h3>

              {menuItemAddons.length === 0 ? (
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
                    No addons linked to this menu item yet.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    disabled={availableAddons.length === 0}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add your first addon
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItemAddons.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <h4 className="font-medium">{item.addon?.name}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          ${item.addon?.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-4">
                        {item.addon?.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {item.addon?.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.is_default && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                          {item.is_required && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Max: {item.max_quantity}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-500 hover:text-blue-700"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to remove "${item.addon?.name}" from this menu item?`
                                )
                              ) {
                                handleDeleteAddon(item.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
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

      {/* Add Addon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Add Addon</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Select Addon
                </label>
                <select
                  value={selectedAddonId}
                  onChange={(e) => setSelectedAddonId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">-- Select an addon --</option>
                  {availableAddons.map((addon) => (
                    <option key={addon.id} value={addon.id}>
                      {addon.name} (${addon.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Maximum Quantity
                </label>
                <input
                  type="number"
                  name="max_quantity"
                  value={formState.max_quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  onBlur={(e) => {
                    // If the field is empty after losing focus, set it to 1
                    if (e.target.value === "") {
                      setFormState((prev) => ({ ...prev, max_quantity: 1 }));
                    }
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formState.is_default}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-gray-700">Set as default</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_required"
                    checked={formState.is_required}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-gray-700">Required addon</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetFormState();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAddon}
                  disabled={!selectedAddonId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Addon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Addon Modal */}
      {editingAddon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Edit Addon</h3>
              <p className="text-blue-100 text-sm">
                {editingAddon.addon?.name}
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Maximum Quantity
                </label>
                <input
                  type="number"
                  name="max_quantity"
                  value={formState.max_quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formState.is_default}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-gray-700">Set as default</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_required"
                    checked={formState.is_required}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-gray-700">Required addon</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddon(null);
                    resetFormState();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateAddon}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Addon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
