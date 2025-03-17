// components/star-rating.tsx
"use client";

import { useState, useEffect } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
}: StarRatingProps) => {
  const [rating, setRating] = useState(Math.round(value));
  const [hover, setHover] = useState(0);

  // Update internal state when value prop changes
  useEffect(() => {
    setRating(Math.round(value));
  }, [value]);

  const handleClick = (selectedRating: number) => {
    if (readOnly) return;

    setRating(selectedRating);
    onChange?.(selectedRating);
  };

  // Determine star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      case "md":
      default:
        return "w-6 h-6";
    }
  };

  const starSize = getStarSize();

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`${
            readOnly ? "cursor-default" : "cursor-pointer"
          } p-0.5 focus:outline-none`}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          disabled={readOnly}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={starSize}
            fill={star <= (hover || rating) ? "#FFB800" : "none"}
            viewBox="0 0 24 24"
            stroke={star <= (hover || rating) ? "#FFB800" : "#D1D5DB"}
            strokeWidth={star <= (hover || rating) ? 0 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};
