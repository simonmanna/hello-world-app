// app/menu-options/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Menu Option Not Found</h2>
      <p className="mb-6 text-gray-600">
        The menu option you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/menu-options"
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Back to Menu Options
      </Link>
    </div>
  );
}
