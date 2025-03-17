// Now let's create our UI components
// components/AddonForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Addon } from "@/types/addon";
import { useRouter } from "next/navigation";

type AddonFormProps = {
  addon?: Addon;
  onSubmit: (addon: Partial<Addon>) => Promise<void>;
};

export default function AddonForm({ addon, onSubmit }: AddonFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Addon>>({
    name: "",
    description: "",
    price: 0,
    is_available: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (addon) {
      setFormData({
        name: addon.name,
        description: addon.description || "",
        price: addon.price,
        is_available: addon.is_available,
      });
    }
  }, [addon]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else if (name === "price") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      router.push("/addons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Price
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_available"
          name="is_available"
          checked={formData.is_available}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label
          htmlFor="is_available"
          className="ml-2 block text-sm font-medium"
        >
          Available
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push("/addons")}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md"
        >
          {loading ? "Saving..." : addon ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
