import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import analyticsService from "../../services/analyticsService";
import notificationService from "../../services/notificationService";
import {
  Users,
  UtensilsCrossed,
  Trash2,
  IndianRupee,
  Star,
  TrendingUp,
  TrendingDown,
  Brain,
  UserPlus,
  UserCog,
  ClipboardEdit,
  FileBarChart,
  Cloud,
  Thermometer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Meal distribution colors — merged server-side with client-side palette
const MEAL_COLORS = {
  Breakfast: "from-emerald-400 to-emerald-600",
  Lunch: "from-teal-400 to-teal-600",
  Dinner: "from-cyan-400 to-cyan-600",
};

const statCards = [
  { label: "Total Students", icon: Users, trend: "+8%", trendUp: true, gradient: "from-emerald-500 to-teal-500" },
  { label: "Meals Served Today", icon: UtensilsCrossed, trend: "+3%", trendUp: true, gradient: "from-teal-500 to-cyan-500" },
  { label: "Food Waste Prediction", icon: Trash2, trend: "-2%", trendUp: false, gradient: "from-rose-500 to-orange-500" },
  { label: "Cost Saved Today", icon: IndianRupee, trend: "+12%", trendUp: true, gradient: "from-emerald-500 to-lime-500" },
  { label: "AI Prediction Accuracy", icon: Brain, trend: "+0.6%", trendUp: true, gradient: "from-violet-500 to-teal-500" },
  { label: "Feedback Score", icon: Star, trend: "+0.2", trendUp: true, gradient: "from-amber-500 to-emerald-500" },
];

const quickActions = [
  { label: "Manage Students", icon: UserPlus,     gradient: "from-emerald-500 to-teal-500", path: "/admin/students" },
  { label: "Manage Staff",    icon: UserCog,      gradient: "from-teal-500 to-cyan-500",    path: "/admin/staff" },
  { label: "Update Menu",     icon: ClipboardEdit,gradient: "from-cyan-500 to-emerald-500", path: "/admin/menu" },
  { label: "Generate Reports",icon: FileBarChart, gradient: "from-emerald-600 to-teal-600", path: "/admin/reports" },
];

const badgeStyles = {
  Positive: "bg-emerald-100 text-emerald-700",
  Neutral: "bg-slate-100 text-slate-600",
  Negative: "bg-rose-100 text-rose-700",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Live data state ───────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [mealDist, setMealDist] = useState([]);
  const [recentFeedbackData, setRecentFeedbackData] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, trendRes, mealRes, feedbackRes] = await Promise.allSettled([
        analyticsService.getAdminDashboardStats(),
        analyticsService.getAttendanceTrend(),
        analyticsService.getMealDistribution(),
        analyticsService.getFeedbackSummary(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        setDashboardStats(statsRes.value.stats);
      }

      if (trendRes.status === "fulfilled" && trendRes.value.success) {
        setAttendanceTrend(trendRes.value.trend);
      }

      if (mealRes.status === "fulfilled" && mealRes.value.success) {
        // Merge server data with client-side color palette
        const colored = mealRes.value.distribution.map((d) => ({
          ...d,
          color: MEAL_COLORS[d.label] || "from-slate-400 to-slate-600",
        }));
        setMealDist(colored);
      }

      if (feedbackRes.status === "fulfilled" && feedbackRes.value.success) {
        const mapped = (feedbackRes.value.summary.recent || []).map((rf) => ({
          student: rf.studentName,
          rating: rf.rating,
          comment: rf.comment,
          badge: rf.sentiment || "Neutral",
        }));
        setRecentFeedbackData(mapped);
      }
    } catch (error) {
      console.error("Admin dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLiveStatValue = (label) => {
    if (!dashboardStats) return <Loader2 className="h-5 w-5 animate-spin text-slate-400" />;
    switch (label) {
      case "Total Students":
        return dashboardStats.totalStudents?.toLocaleString("en-IN");
      case "Meals Served Today":
        return dashboardStats.mealsServedToday?.toLocaleString("en-IN");
      case "Food Waste Prediction":
        return `${dashboardStats.foodWastePercent ?? 0}%`;
      case "Cost Saved Today":
        return `₹${(dashboardStats.costSavedToday ?? 0).toLocaleString("en-IN")}`;
      case "AI Prediction Accuracy":
        return `${dashboardStats.aiAccuracy ?? 98.4}%`;
      case "Feedback Score":
        return dashboardStats.feedbackScore ?? "—";
      default:
        return "—";
    }
  };

  // Generate today's recent activities
  const recentActivities = [
    { time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), action: "Dashboard Loaded", user: user?.name || "Admin", status: "Completed" },
    { time: "—", action: `Meals Served Today`, user: "System", status: dashboardStats?.mealsServedToday > 0 ? "Completed" : "Pending" },
    { time: "—", action: "AI Prediction Updated", user: "AI Engine", status: "Completed" },
    { time: "—", action: `Feedback Score: ${dashboardStats?.feedbackScore ?? "..."}`, user: "System", status: "Completed" },
  ];

  const statusStyles = {
    Completed: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Review: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-500">
          Manage hostel mess operations using AI-powered insights.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map(({ label, icon: Icon, trend, trendUp, gradient }) => (
          <div
            key={label}
            className="group rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-800">{getLiveStatValue(label)}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Analytics section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-800">Attendance Overview</h2>
          <p className="text-sm text-slate-500 mb-6">Weekly mess attendance trend</p>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-48">
              {attendanceTrend.map(({ day, value }) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full flex items-end h-40 rounded-xl bg-slate-100 overflow-hidden">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-700"
                      style={{ height: `${Math.min(value, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-800">Meal Distribution</h2>
          <p className="text-sm text-slate-500 mb-6">Today's turnout by meal</p>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : mealDist.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No attendance data for today yet</p>
          ) : (
            <div className="space-y-5">
              {mealDist.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-800">{value}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                      style={{ width: `${Math.min(value, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Insight + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white/80 to-teal-500/10 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Today's AI Recommendation</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 mb-5">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              Reduce rice preparation by 8% based on recent consumption patterns.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              Increase chapati count by 6% for tonight's dinner service.
            </li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl bg-white/70 px-4 py-3 border border-white/60">
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="text-lg font-bold text-slate-800">
                {dashboardStats ? dashboardStats.totalStudents?.toLocaleString("en-IN") : "..."}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-3 border border-white/60">
              <p className="text-xs text-slate-500">Estimated Food Waste</p>
              <p className="text-lg font-bold text-emerald-600">
                {dashboardStats ? `${dashboardStats.foodWastePercent ?? 0}%` : "..."}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-3 border border-white/60">
              <p className="text-xs text-slate-500">Cost Saved Today</p>
              <p className="text-lg font-bold text-teal-600">
                {dashboardStats ? `₹${(dashboardStats.costSavedToday ?? 0).toLocaleString("en-IN")}` : "..."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">AI Status</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Online
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-5 shadow-lg shadow-slate-200/50 space-y-4">
            <div className="flex items-center gap-3">
              <Cloud className="h-5 w-5 text-teal-500" />
              <div>
                <p className="text-xs text-slate-500">Today's Date</p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-500">Total Staff</p>
                <p className="text-sm font-semibold text-slate-800">
                  {dashboardStats?.totalStaff ?? "..."} active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-xs text-slate-500">Current Time</p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions — ISSUE 3 FIX: buttons now navigate to their target page */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map(({ label, icon: Icon, gradient, path }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              aria-label={label}
              className="group flex flex-col items-center gap-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activities + feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">By</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map(({ time, action, user: actUser, status }, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 text-slate-500 text-xs">{time}</td>
                  <td className="py-3 font-medium text-slate-700">{action}</td>
                  <td className="py-3 text-slate-500">{actUser}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.Pending}`}>
                      {status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-lg shadow-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Feedback</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : recentFeedbackData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No feedback yet</p>
          ) : (
            <div className="space-y-4">
              {recentFeedbackData.map(({ student, rating, comment, badge }, i) => (
                <div key={i} className="rounded-2xl bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{student}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeStyles[badge] || badgeStyles.Neutral}`}>
                      {badge}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
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

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-slate-400">
        SmartMess AI Admin Dashboard · Hackathon 2026
      </footer>
    </div>
  );
}