// app/dashboard/layout.jsx
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-1">{children}</main>
      </div>
    </div>
  );
}
