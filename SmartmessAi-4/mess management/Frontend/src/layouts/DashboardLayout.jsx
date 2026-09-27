import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const studentName = user?.name?.split(" ")[0] || "Student";

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Ambient background blur orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-300/25 blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl z-0" />

      <div className="relative z-10 flex min-h-screen">
        {/* Responsive Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen">
          <Topbar studentName={studentName} onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}