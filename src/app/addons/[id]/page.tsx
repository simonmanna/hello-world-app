// app/addons/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Addon } from "../../../types/addon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function AddonDetail({ params }: { params: { id: string } }) {
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [addon, setAddon] = useState<Addon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this addon?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/addons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete addon");
      }

      router.push("/addons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setDeleting(false);
    }
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
        <Link href="/addons" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Addons
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-4">{addon.name}</h1>

        {addon.description && (
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500">Description</h2>
            <p className="mt-1">{addon.description}</p>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500">Price</h2>
          <p className="mt-1">${addon.price.toFixed(2)}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500">Availability</h2>
          <p className="mt-1">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                addon.is_available
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {addon.is_available ? "Available" : "Unavailable"}
            </span>
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500">Created At</h2>
          <p className="mt-1">{new Date(addon.created_at).toLocaleString()}</p>
        </div>

        <div className="flex space-x-4 mt-6">
          <Link
            href={`/addons/${addon.id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
