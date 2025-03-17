// app/components/MenuDetailModal.tsx
"use client";

import { useEffect, useState } from "react";

interface MenuItem {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  category_id: number | null;
  is_popular: number | null;
  view_order: number | null;
}

interface MenuDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function MenuDetailModal({
  item,
  onClose,
}: MenuDetailModalProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Show animation when modal opens
  useEffect(() => {
    if (item) {
      setIsVisible(true);
    }
  }, [item]);

  // Handle closing the modal
  const handleClose = () => {
    setIsVisible(false);
    // Delay the onClose to allow the animation to finish
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Close modal when clicking outside of it
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // If no item is selected, don't render anything
  if (!item) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Item Image */}
        <div className="relative h-64 w-full">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          {item.is_popular === 1 && (
            <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Popular
            </span>
          )}
          <button
            className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={handleClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Item Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{item.name}</h2>
            {item.price !== null && (
              <span className="text-xl font-bold text-green-600">
                ${item.price.toFixed(2)}
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-gray-700 mb-6">{item.description}</p>
          )}

          {/* Add to cart button or other actions could go here */}
          <div className="flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
