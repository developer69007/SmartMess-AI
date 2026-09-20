import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import notificationService from "../services/notificationService";
import {
  LayoutDashboard,
  BarChart3,
  GraduationCap,
  UserCog,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  UtensilsCrossed,
  Sparkles,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Students",        icon: GraduationCap,    path: "/admin/students" },
  { label: "Staff",           icon: UserCog,          path: "/admin/staff" },
  { label: "Menu Management", icon: ClipboardList,    path: "/admin/menu" },
  { label: "Analytics",       icon: BarChart3,        path: "/admin/analytics" },
  { label: "AI Insights",     icon: Sparkles,         path: "/admin/ai-insights" },
  { label: "Reports",         icon: FileText,         path: "/admin/reports" },
  { label: "Settings",        icon: Settings,         path: "/admin/settings" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    notificationService
      .getNotifications()
      .then((res) => {
        if (isMounted && res?.success) {
          setUnreadNotifCount(res.unreadCount || 0);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login/admin");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "A";

  const isNavActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Ambient blur orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-300/30 blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl z-0" />

      <div className="relative z-10 flex min-h-screen">
        {/* Persistent Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Header / Logo */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100/60">
              <Link to="/admin/dashboard" className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-800">
                  SmartMess <span className="text-emerald-600">AI</span>
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close sidebar"
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

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area (offset by sidebar width on desktop) */}
        <div className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
          {/* Top Bar Header */}
          <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/60 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <button
                  type="button"
                  aria-label="Open sidebar"
                  className="lg:hidden rounded-xl p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2 w-full max-w-sm rounded-2xl bg-white/80 border border-slate-200 px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search students, staff, reports..."
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span className="hidden md:block text-sm font-medium text-slate-500">
                  {today}
                </span>

                {/* Notifications */}
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => navigate("/admin/analytics")}
                  className="relative rounded-2xl bg-white/80 border border-slate-200 p-2.5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Bell className="h-4 w-4 text-slate-500" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Profile dropdown */}
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
                      {user?.name?.split(" ")[0] || "Admin"}
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
                            {user?.name || "Admin"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {user?.email || "admin@smartmess.ai"}
                          </p>
                        </div>
                        <div className="py-1 border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              navigate("/admin/profile");
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
                              navigate("/admin/settings");
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

          {/* Subpage content rendered through Outlet */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
