"use client";

import { useEffect, useState } from "react";
import { Addon } from "@/types/addon";
import AddonForm from "@/components/AddonForm";
import Link from "next/link";
import { use } from "react";

export default function EditAddon({ params }: { params: { id: string } }) {
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [addon, setAddon] = useState<Addon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddon = async () => {
      try {
        const response = await fetch(`/api/addons/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch addon");
        }
        const data = await response.json();
        setAddon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAddon();
  }, [id]);

  const handleUpdateAddon = async (addonData: Partial<Addon>) => {
    const response = await fetch(`/api/addons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addonData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update addon");
    }

    return response.json();
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  if (!addon) {
    return <div className="text-center p-8">Addon not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/addons/${id}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          &larr; Back to Addon Details
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Edit Addon</h1>
      <AddonForm addon={addon} onSubmit={handleUpdateAddon} />
    </div>
  );
}
