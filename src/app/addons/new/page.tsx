// app/addons/new/page.tsx
"use client";

import { useState } from "react";
import AddonForm from "../../../components/AddonForm";
import { Addon } from "../../../types/addon";

export default function NewAddon() {
  const [error, setError] = useState<string | null>(null);

  const handleCreateAddon = async (addonData: Partial<Addon>) => {
    const response = await fetch("/api/addons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addonData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create addon");
    }

    return response.json();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Addon</h1>

      {error && (
        <div className="bg-red-50 p-4 rounded text-red-700 mb-6">{error}</div>
      )}

      <AddonForm onSubmit={handleCreateAddon} />
    </div>
  );
}
