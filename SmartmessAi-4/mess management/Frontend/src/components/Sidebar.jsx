import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarCheck,
  QrCode,
  MessageSquareText,
  User,
  Settings,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
  { label: "Today's Menu", icon: UtensilsCrossed, to: "/student/menu" },
  { label: "Attendance", icon: CalendarCheck, to: "/student/attendance" },
  { label: "QR Attendance", icon: QrCode, to: "/student/scanner" },
  { label: "Feedback", icon: MessageSquareText, to: "/student/feedback" },
  { label: "Profile", icon: User, to: "/student/profile" },
  { label: "Settings", icon: Settings, to: "/student/settings" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform flex flex-col border-r border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xl lg:shadow-none transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30">
            <Sparkles size={18} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            SmartMess <span className="text-emerald-600">AI</span>
          </span>
        </div>
        <button
          type="button"
          className="lg:hidden rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Menu Links */}
      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={2}
                className={`shrink-0 transition-transform duration-200 ${
                  isActive ? "text-white scale-105" : "text-slate-400 group-hover:scale-110 group-hover:text-emerald-600"
                }`}
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}