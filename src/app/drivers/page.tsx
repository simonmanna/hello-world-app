// app/drivers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define Driver interface based on the table structure
interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  vehicle_type: string;
  license_number: string;
  created_at: string;
  updated_at: string | null;
}

// Empty driver object for form initialization
const emptyDriver: Omit<Driver, "id" | "created_at" | "updated_at"> = {
  name: "",
  phone: "",
  email: "",
  is_active: true,
  vehicle_type: "",
  license_number: "",
};

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentDriver, setCurrentDriver] =
    useState<Omit<Driver, "id" | "created_at" | "updated_at">>(emptyDriver);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Fetch all drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Fetch drivers from Supabase
  async function fetchDrivers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching drivers:", error);
      setError("Failed to load drivers. Please try again later.");
    } else {
      setDrivers(data || []);
      setError(null);
    }
    setLoading(false);
  }

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setCurrentDriver((prev) => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setCurrentDriver((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Open modal for creating a new driver
  function handleAddDriver() {
    setCurrentDriver(emptyDriver);
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  }

  // Open modal for editing an existing driver
  function handleEditDriver(driver: Driver) {
    const { id, created_at, updated_at, ...editableFields } = driver;
    setCurrentDriver(editableFields);
    setIsEditing(true);
    setEditingId(id);
    setIsModalOpen(true);
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && editingId) {
        // Update existing driver
        const { error } = await supabase
          .from("drivers")
          .update({
            ...currentDriver,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create new driver
        const { error } = await supabase
          .from("drivers")
          .insert([currentDriver]);

        if (error) throw error;
      }

      // Refresh driver list and close modal
      await fetchDrivers();
      setIsModalOpen(false);
      setCurrentDriver(emptyDriver);
    } catch (error) {
      console.error("Error saving driver:", error);
      setError("Failed to save driver. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle driver status toggle
  async function handleToggleActive(id: string, currentStatus: boolean) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("drivers")
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      await fetchDrivers();
    } catch (error) {
      console.error("Error updating driver status:", error);
      setError("Failed to update driver status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle driver deletion
  async function handleDeleteDriver(id: string) {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("drivers").delete().eq("id", id);

      if (error) throw error;
      await fetchDrivers();
    } catch (error) {
      console.error("Error deleting driver:", error);
      setError("Failed to delete driver. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Driver Management</h1>

      {/* Alert for errors */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          role="alert"
        >
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Search and Add section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleAddDriver}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center w-full md:w-auto justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add New Driver
        </button>
      </div>

      {/* Drivers Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vehicle
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                License
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && !filteredDrivers.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading drivers...
                </td>
              </tr>
            ) : filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm
                    ? "No drivers match your search"
                    : "No drivers found"}
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  className={!driver.is_active ? "bg-gray-100" : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {driver.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.phone}</div>
                    <div className="text-sm text-gray-500">{driver.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.vehicle_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.license_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {driver.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        handleToggleActive(driver.id, driver.is_active)
                      }
                      className={`mr-3 ${
                        driver.is_active
                          ? "text-amber-600 hover:text-amber-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {driver.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEditDriver(driver)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver.id)}
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

      {/* Add/Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? "Edit Driver" : "Add New Driver"}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Name field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={currentDriver.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Phone field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={currentDriver.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={currentDriver.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Vehicle Type field */}
                <div>
                  <label
                    htmlFor="vehicle_type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vehicle Type *
                  </label>
                  <select
                    id="vehicle_type"
                    name="vehicle_type"
                    required
                    value={currentDriver.vehicle_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                {/* License Number field */}
                <div>
                  <label
                    htmlFor="license_number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    License Number *
                  </label>
                  <input
                    type="text"
                    id="license_number"
                    name="license_number"
                    required
                    value={currentDriver.license_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Active Status checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={currentDriver.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Driver"
                    : "Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
