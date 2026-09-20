import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import staffService from "../../services/staffService";
import menuService from "../../services/menuService";
import notificationService from "../../services/notificationService";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  CalendarCheck,
  ChefHat,
  Package,
  MessageSquare,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  UtensilsCrossed,
  Users,
  Flame,
  Brain,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Thermometer,
  Droplet,
  ScanLine,
  Pencil,
  Plus,
  Sparkles,
  BadgeCheck,
  XCircle,
  Hourglass,
  FileBarChart,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Today's Menu", icon: UtensilsCrossed },
  { label: "QR Verification", icon: QrCode },
  { label: "Attendance", icon: CalendarCheck },
  { label: "Kitchen Status", icon: ChefHat },
  { label: "Inventory", icon: Package },
  { label: "Feedback", icon: MessageSquare },
  { label: "Reports", icon: FileText },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
];

// Static config — only metadata, values come from live API
const statCardsMeta = [
  { label: "Meals Prepared Today", icon: UtensilsCrossed, trend: "+4%", trendUp: true, gradient: "from-emerald-500 to-teal-500" },
  { label: "Students Served", icon: Users, trend: "+6%", trendUp: true, gradient: "from-teal-500 to-cyan-500" },
  { label: "QR Scans", icon: QrCode, trend: "+2%", trendUp: true, gradient: "from-cyan-500 to-emerald-500" },
  { label: "Kitchen Efficiency", icon: Flame, trend: "+1.2%", trendUp: true, gradient: "from-orange-500 to-amber-500" },
  { label: "Inventory Level", icon: Package, trend: "-3%", trendUp: false, gradient: "from-emerald-500 to-lime-500" },
  { label: "Pending Tasks", icon: ClipboardList, trend: "-2", trendUp: true, gradient: "from-violet-500 to-teal-500" },
];

const quickActions = [
  { label: "Prepare Meal", icon: UtensilsCrossed, gradient: "from-emerald-500 to-teal-500" },
  { label: "Verify QR", icon: ScanLine, gradient: "from-teal-500 to-cyan-500" },
  { label: "Update Inventory", icon: Package, gradient: "from-cyan-500 to-emerald-500" },
  { label: "View Reports", icon: FileBarChart, gradient: "from-emerald-600 to-teal-600" },
];

const badgeStyles = {
  Positive: "bg-emerald-100 text-emerald-700",
  Neutral: "bg-slate-100 text-slate-600",
  Negative: "bg-rose-100 text-rose-700",
};

const statusStyles = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-cyan-100 text-cyan-700",
};

export default function StaffDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // ── Live data ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mealsPreppedToday: "...",
    studentsServedToday: "...",
    qrScansToday: "...",
    kitchenEfficiency: "...",
    inventoryLevel: "...",
    pendingTasks: "...",
  });
  const [menu, setMenu] = useState([
    { meal: "Breakfast", items: [], time: "7:30 – 9:00 AM" },
    { meal: "Lunch", items: [], time: "12:30 – 2:00 PM" },
    { meal: "Dinner", items: [], time: "7:30 – 9:00 PM" },
  ]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [kitchenStatus, setKitchenStatus] = useState(null);
  const [qrStats, setQrStats] = useState([
    { label: "Successful Scans", value: "...", icon: BadgeCheck, color: "text-emerald-600" },
    { label: "Rejected", value: "...", icon: XCircle, color: "text-rose-600" },
    { label: "Pending", value: "...", icon: Hourglass, color: "text-amber-600" },
  ]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, menuRes, kitchenRes, notifRes] = await Promise.allSettled([
        staffService.getStaffDashboardStats(),
        menuService.getTodaysMenu(),
        staffService.getKitchenStatus(),
        notificationService.getNotifications(),
      ]);

      // Stats
      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        const s = statsRes.value.stats;
        setStats({
          mealsPreppedToday: s.mealsPreppedToday ?? 0,
          studentsServedToday: s.studentsServedToday ?? 0,
          qrScansToday: s.qrScansToday ?? 0,
          kitchenEfficiency: s.kitchenEfficiency ?? 96,
          inventoryLevel: s.inventoryLevel ?? 82,
          pendingTasks: s.pendingTasks ?? 0,
        });

        // Update QR stats from the same API call
        setQrStats([
          { label: "Successful Scans", value: s.qrScansToday ?? 0, icon: BadgeCheck, color: "text-emerald-600" },
          { label: "Rejected", value: 0, icon: XCircle, color: "text-rose-600" },
          { label: "Pending", value: s.pendingTasks ?? 0, icon: Hourglass, color: "text-amber-600" },
        ]);

        // Live feedback from analytics
        if (statsRes.value.recentFeedback) {
          setFeedbacks(
            statsRes.value.recentFeedback.map((f) => ({
              student: f.studentName || "Student",
              rating: f.rating,
              comment: f.comment,
              badge: f.sentiment || "Neutral",
            }))
          );
        }
      }

      // Menu
      if (menuRes.status === "fulfilled" && menuRes.value.success && menuRes.value.menu) {
        const m = menuRes.value.menu;
        setMenu([
          { meal: "Breakfast", items: m.meals?.breakfast?.items || [], time: m.meals?.breakfast?.time || "7:30 – 9:00 AM" },
          { meal: "Lunch", items: m.meals?.lunch?.items || [], time: m.meals?.lunch?.time || "12:30 – 2:00 PM" },
          { meal: "Dinner", items: m.meals?.dinner?.items || [], time: m.meals?.dinner?.time || "7:30 – 9:00 PM" },
        ]);
      }

      // Kitchen status
      if (kitchenRes.status === "fulfilled" && kitchenRes.value.success) {
        setKitchenStatus(kitchenRes.value.status);
      }

      // Notification count
      if (notifRes.status === "fulfilled" && notifRes.value.success) {
        setUnreadNotifCount(notifRes.value.unreadCount || 0);
      }
    } catch (error) {
      console.error("Staff dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLiveStatValue = (label) => {
    switch (label) {
      case "Meals Prepared Today": return stats.mealsPreppedToday;
      case "Students Served": return stats.studentsServedToday;
      case "QR Scans": return stats.qrScansToday;
      case "Kitchen Efficiency": return `${stats.kitchenEfficiency}%`;
      case "Inventory Level": return `${stats.inventoryLevel}%`;
      case "Pending Tasks": return stats.pendingTasks;
      default: return "—";
    }
  };

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

  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "S";

  // Kitchen status display helper
  const kitchenStatusItems = kitchenStatus
    ? [
        { label: "Cooking Status", value: kitchenStatus.cookingStatus || "Pending", icon: CheckCircle2, tone: kitchenStatus.cookingStatus === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700" },
        { label: "Preparing Meal", value: kitchenStatus.preparingMeal || "None", icon: Clock, tone: "bg-cyan-100 text-cyan-700" },
        { label: "Cleaning Status", value: kitchenStatus.cleaningStatus || "Pending", icon: AlertCircle, tone: kitchenStatus.cleaningStatus === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600" },
        { label: "Gas Supply", value: kitchenStatus.gasStatus || "Normal", icon: Flame, tone: "bg-emerald-100 text-emerald-700" },
        { label: "Water Supply", value: kitchenStatus.waterStatus || "Available", icon: Droplet, tone: "bg-cyan-100 text-cyan-700" },
      ]
    : [];

  // Recent tasks (static skeleton — no task model exists)
  const recentTasks = [
    { time: "09:00", task: "Prepare Breakfast", assignedTo: "Kitchen Team", status: "Completed" },
    { time: "11:15", task: "Update Inventory", assignedTo: "Store Staff", status: "Pending" },
    { time: "12:20", task: "Verify QR Batch", assignedTo: "Reception", status: "Completed" },
    { time: "13:45", task: "Restock Spices", assignedTo: "Store Staff", status: "In Progress" },
    { time: "14:30", task: "Clean Dining Hall", assignedTo: "Housekeeping", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Ambient blur orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-300/30 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative flex">
        {/* Sidebar */}
        <aside
          className={`fixed z-40 inset-y-0 left-0 w-72 transform bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-6 py-6">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-800">
                  SmartMess <span className="text-emerald-600">AI</span>
                </span>
              </div>
              <button
                className="lg:hidden text-slate-500 hover:text-slate-800"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              {navItems.map(({ label, icon: Icon }) => {
                const isActive = activeNav === label;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveNav(label)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"
                      }`}
                    />
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="px-4 py-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top navigation */}
          <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/60 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <button
                  className="lg:hidden text-slate-600 hover:text-slate-900"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2 w-full max-w-sm rounded-2xl bg-white/80 border border-slate-200 px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tasks, menu, inventory..."
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span className="hidden md:block text-sm text-slate-500">{today}</span>

                <button className="relative rounded-2xl bg-white/80 border border-slate-200 p-2.5 shadow-sm hover:shadow-md transition-shadow">
                  <Bell className="h-4 w-4 text-slate-500" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
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
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-100 shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        {user?.department && (
                          <p className="text-xs text-emerald-600 capitalize mt-0.5">{user.department} dept.</p>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-3 text-left text-sm text-rose-500 hover:bg-rose-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-6 py-6 space-y-6">
            {/* Heading */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                {greeting}, {user?.name?.split(" ")[0] || "Chef"} 👋
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-500">
                Today's hostel mess operations overview. Let's serve great food!
              </p>
            </div>

            {/* Stat cards — live values via getLiveStatValue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {statCardsMeta.map(({ label, icon: Icon, trend, trendUp, gradient }) => (
                <div
                  key={label}
                  className="group rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {trend}
                    </span>
                  </div>
                  {/* FIXED: was {value} — now calls getLiveStatValue(label) */}
                  <p className="mt-4 text-2xl font-bold text-slate-800">{getLiveStatValue(label)}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Today's Menu + QR Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-slate-800">Today's Menu</h2>
                  <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-shadow">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Menu
                  </button>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-28">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {menu.map(({ meal, items, time }) => (
                      <div key={meal} className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-800">{meal}</h3>
                          <Plus className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{time}</p>
                        {items.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Not set</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {items.map((item) => (
                              <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 mb-4">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">QR Verification</h2>
                <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-shadow mb-5">
                  <ScanLine className="h-4 w-4" />
                  Open QR Scanner
                </button>
                <div className="w-full space-y-3">
                  {qrStats.map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-2.5"
                    >
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon className={`h-4 w-4 ${color}`} />
                        {label}
                      </span>
                      <span className="font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kitchen Status + AI Recommendation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Kitchen Status</h2>
                {loading ? (
                  <div className="flex items-center justify-center h-28">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  </div>
                ) : kitchenStatusItems.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No status set for today</p>
                ) : (
                  <div className="space-y-3">
                    {kitchenStatusItems.map(({ label, value, icon: Icon, tone }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <Icon className="h-4 w-4 text-slate-400" />
                          {label}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white/80 to-teal-500/10 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800">Today's Recommendation</h2>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 mb-5">
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Increase chapati preparation by 6% for tonight's service.
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Reduce rice preparation by 8% based on recent trends.
                  </li>
                </ul>
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-2xl bg-white/70 px-4 py-3 border border-white/60">
                    <p className="text-xs text-slate-500">Students Served Today</p>
                    <p className="text-lg font-bold text-slate-800">{stats.studentsServedToday}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3 border border-white/60">
                    <p className="text-xs text-slate-500">Kitchen Efficiency</p>
                    <p className="text-lg font-bold text-emerald-600">{stats.kitchenEfficiency}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3 border border-white/60">
                    <p className="text-xs text-slate-500">QR Scans Done</p>
                    <p className="text-lg font-bold text-teal-600">{stats.qrScansToday}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {quickActions.map(({ label, icon: Icon, gradient }) => (
                  <button
                    key={label}
                    className="group flex flex-col items-center gap-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent tasks + Live feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50 overflow-x-auto">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Tasks</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-medium">Time</th>
                      <th className="pb-3 font-medium">Task</th>
                      <th className="pb-3 font-medium">Assigned To</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map(({ time, task, assignedTo, status }) => (
                      <tr key={time + task} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-slate-500">{time}</td>
                        <td className="py-3 font-medium text-slate-700">{task}</td>
                        <td className="py-3 text-slate-500">{assignedTo}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || "bg-slate-100 text-slate-600"}`}>
                            {status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FIXED: was rendering from static recentFeedback constant, now uses feedbacks state */}
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Feedback</h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : feedbacks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No feedback yet</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map(({ student, rating, comment, badge }, i) => (
                      <div key={i} className="rounded-2xl bg-slate-50/80 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-slate-700">{student}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeStyles[badge] || badgeStyles.Neutral}`}>
                            {badge}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className={`h-3.5 w-3.5 ${j < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom info widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 flex items-center gap-3">
                <Thermometer className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-slate-500">Kitchen Temperature</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {kitchenStatus?.temperature || "24°C, Optimal"}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-slate-500">Gas Status</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {kitchenStatus?.gasStatus || "Normal"}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 flex items-center gap-3">
                <Clock className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="text-xs text-slate-500">Current Time</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 flex items-center gap-3">
                <Users className="h-5 w-5 text-teal-500" />
                <div>
                  <p className="text-xs text-slate-500">Students Served</p>
                  <p className="text-sm font-semibold text-slate-800">{stats.studentsServedToday}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">AI Status</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Online
                </span>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-6 text-sm text-slate-400">
              SmartMess AI Staff Dashboard · Hackathon 2026
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}