import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  CalendarCheck,
  ChefHat,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/staff/dashboard" },
  { label: "Today's Menu",   icon: UtensilsCrossed, path: "/staff/meal-management" },
  { label: "QR Verification", icon: QrCode,          path: "/staff/qr-verification" },
  { label: "Attendance",      icon: CalendarCheck,   path: "/staff/attendance" },
  { label: "Kitchen Status",  icon: ChefHat,         path: "/staff/kitchen-status" },
  { label: "Reports",         icon: FileText,        path: "/staff/reports" },
  { label: "Profile",         icon: User,            path: "/staff/profile" },
  { label: "Settings",        icon: Settings,        path: "/staff/settings" },
];

export default function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login/staff");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "S";

  const isNavActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Ambient blur orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-300/25 blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl z-0" />

      <div className="relative z-10 flex min-h-screen">
        {/* Persistent Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white/80 backdrop-blur-xl border-r border-slate-200/80 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Header / Logo */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
              <Link to="/staff/dashboard" className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-800">
                  SmartMess <span className="text-emerald-600">Staff</span>
                </span>
              </Link>
              <button
                type="button"
                className="lg:hidden rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {navItems.map(({ label, icon: Icon, path }) => {
                const active = isNavActive(path);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate(path);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-white" : "text-slate-400 group-hover:text-emerald-600"
                      }`}
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout button */}
            <div className="px-4 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
          {/* Top Bar Header */}
          <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/60 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <button
                  type="button"
                  className="lg:hidden rounded-xl p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2 w-full max-w-sm rounded-2xl bg-white/80 border border-slate-200 px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search menu, attendance, tasks..."
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span className="hidden md:block text-sm font-medium text-slate-500">
                  {today}
                </span>

                <button
                  type="button"
                  onClick={() => navigate("/staff/reports")}
                  className="relative rounded-2xl bg-white/80 border border-slate-200 p-2.5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Bell className="h-4 w-4 text-slate-500" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-2xl bg-white/80 border border-slate-200 pl-2 pr-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-semibold text-white">
                      {userInitial}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700">
                      {user?.name?.split(" ")[0] || "Staff"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-100 shadow-xl overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {user?.name || "Staff Member"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {user?.email || "staff@smartmess.ai"}
                          </p>
                        </div>
                        <div className="py-1 border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              navigate("/staff/profile");
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>My Profile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              navigate("/staff/settings");
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
