// app/menu-options/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, MenuOption } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function MenuOptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: menuOption, error } = await supabase
    .from("menu_options")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !menuOption) {
    notFound();
  }

  const option = menuOption as MenuOption;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{option.name}</h1>
        <div className="space-x-4">
          <Link
            href={`/menu-options/${option.id}/edit`}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Edit
          </Link>
          <Link
            href="/menu-options"
            className="border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-lg text-gray-900">{option.name}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">
              Price Adjustment
            </dt>
            <dd className="mt-1 text-lg text-gray-900">
              ${option.price_adjustment?.toFixed(2) || "0.00"}
            </dd>
          </div>

          <div className="col-span-1 md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-lg text-gray-900">
              {option.description || (
                <span className="text-gray-400">No description provided</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span
                className={`px-2 py-1 text-sm font-semibold rounded-full ${
                  option.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {option.is_active ? "Active" : "Inactive"}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-lg text-gray-900">
              {option.created_at ? (
                new Date(option.created_at).toLocaleDateString()
              ) : (
                <span className="text-gray-400">Not available</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
