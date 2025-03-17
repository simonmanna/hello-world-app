"use client";

import { useState } from "react";
import { MenuOption } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type MenuOptionFormProps = {
  menuOption?: MenuOption;
  id?: string;
};

export default function MenuOptionForm({
  menuOption,
  id,
}: MenuOptionFormProps) {
  const isEditing = !!id;
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<MenuOption>>({
    name: menuOption?.name || "",
    description: menuOption?.description || "",
    price_adjustment: menuOption?.price_adjustment || 0,
    is_active: menuOption?.is_active !== false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === "price_adjustment") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      if (isEditing && id) {
        // Update existing menu option
        response = await fetch(`/api/menu-options/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new menu option
        response = await fetch("/api/menu-options", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save menu option");
      }

      router.push("/menu-options");
      router.refresh(); // Refresh the current page data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
        </div>
      )}

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
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label
          htmlFor="price_adjustment"
          className="block text-sm font-medium text-gray-700"
        >
          Price Adjustment ($)
        </label>
        <input
          type="number"
          id="price_adjustment"
          name="price_adjustment"
          step="0.01"
          value={formData.price_adjustment}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active === true}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
