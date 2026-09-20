import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64">
        <Sidebar />
      </div>

      <div className="lg:pl-64">
        <Topbar studentName="Yashashvi" />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}