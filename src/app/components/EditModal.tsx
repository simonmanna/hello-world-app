// app/components/EditModal.tsx
"use client";

import { useState, useRef } from "react";

interface EditableItem {
  id: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  price?: number | null;
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
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");
  const [price, setPrice] = useState<string>(item.price?.toString() || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({
      ...item,
      name,
      description,
      imageUrl,
      price: price ? parseFloat(price) : null,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const url = await onImageUpload(file);
      if (url) {
        setImageUrl(url);
      } else {
        setUploadError("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setPrice(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Edit {item.type === "category" ? "Category" : "Menu Item"}
          </h3>
        </div>

        <div className="p-6">
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter name"
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter description"
            />
          </div>

          {/* Price Input (Only for menu items) */}
          {item.type === "menuItem" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (UGX)
              </label>
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
              />
            </div>
          )}

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-start">
              <div className="mr-4">
                <div className="h-24 w-24 border rounded-md overflow-hidden bg-gray-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleClickUpload}
                  disabled={isUploading}
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mb-2"
                >
                  {isUploading ? "Uploading..." : "Upload New Image"}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="px-3 py-2 text-red-600 hover:text-red-800 block text-sm"
                  >
                    Remove Image
                  </button>
                )}
                {uploadError && (
                  <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
