"use client";
// components/dashboard/Navbar.tsx
import { useState } from "react";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  return (
    <header className="bg-white border-b bg-gray-800 border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2">
            <span className="sr-only">View notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            <span>🔔</span>
          </button>

          <div className="relative">
            <button
              className="flex items-center space-x-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                A
              </div>
              <span>Admin</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
