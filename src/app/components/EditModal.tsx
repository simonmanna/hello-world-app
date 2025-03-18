// app/components/EditModal.tsx
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface Category {
  id: number;
  name: string | null;
  parent_id: number | null;
}

interface EditableItem {
  id: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  price?: number | null;
  category_id?: number | null;
  parent_id?: number | null;
  type: "category" | "menuItem";
}

interface EditModalProps {
  item: EditableItem;
  onClose: () => void;
  onSave: (editedItem: EditableItem) => void;
  onImageUpload: (file: File) => Promise<string | null>;
}

export default function EditModal({
  item,
  onClose,
  onSave,
  onImageUpload,
}: EditModalProps) {
  const [name, setName] = useState(item.name || "");
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price?.toString() || "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(
    item.category_id || null
  );
  const [parentId, setParentId] = useState<number | null>(
    item.parent_id || null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, parent_id")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
      } else if (data) {
        setCategories(data);
      }
      setLoading(false);
    }

    fetchCategories();
  }, []);

  // Filter categories to prevent circular references
  const availableCategories =
    item.type === "category"
      ? categories.filter((cat) => cat.id !== item.id)
      : categories;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const uploadedUrl = await onImageUpload(file);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      }
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const editedItem: EditableItem = {
      ...item,
      name,
      description,
      imageUrl,
    };

    if (item.type === "menuItem") {
      editedItem.price = price ? parseFloat(price) : null;
      editedItem.category_id = categoryId;
    } else {
      // For categories
      editedItem.parent_id = parentId;
    }

    onSave(editedItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Edit {item.type === "category" ? "Category" : "Menu Item"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
            />
          </div>

          {/* For Menu Items: Category Selection */}
          {item.type === "menuItem" && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category
              </label>
              <select
                value={categoryId || ""}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select Category</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* For Categories: Parent Category Selection */}
          {item.type === "category" && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Parent Category
              </label>
              <select
                value={parentId || ""}
                onChange={(e) =>
                  setParentId(e.target.value ? parseInt(e.target.value) : null)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">No Parent (Root Category)</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price field for menu items */}
          {item.type === "menuItem" && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Price (UGX)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Image
            </label>
            {imageUrl && (
              <div className="mb-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-32 w-auto object-cover rounded"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && (
              <p className="mt-1 text-sm text-blue-600">Uploading...</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
