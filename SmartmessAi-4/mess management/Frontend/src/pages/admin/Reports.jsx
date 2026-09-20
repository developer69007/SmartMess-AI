import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart, Download, Calendar, TrendingUp, Users,
  UtensilsCrossed, Star, Trash2, Loader2, RefreshCw
} from "lucide-react";
import analyticsService from "../../services/analyticsService";
import toast from "react-hot-toast";

function StatRow({ label, value, sub, highlight }) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-50 last:border-0 ${highlight ? "bg-emerald-50/50 -mx-4 px-4 rounded-xl" : ""}`}>
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <span className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-slate-900"}`}>{value ?? "—"}</span>
    </div>
  );
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [mealDist, setMealDist] = useState([]);
  const [feedSummary, setFeedSummary] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [sRes, tRes, mRes, fRes] = await Promise.allSettled([
        analyticsService.getAdminDashboardStats(),
        analyticsService.getAttendanceTrend(30),
        analyticsService.getMealDistribution(),
        analyticsService.getFeedbackSummary(),
      ]);
      if (sRes.status === "fulfilled" && sRes.value.success) setStats(sRes.value.stats);
      if (tRes.status === "fulfilled" && tRes.value.success) setTrend(tRes.value.trend);
      if (mRes.status === "fulfilled" && mRes.value.success) setMealDist(mRes.value.distribution);
      if (fRes.status === "fulfilled" && fRes.value.success) setFeedSummary(fRes.value.summary);
    } catch { toast.error("Failed to load report data"); }
    finally { setLoading(false); }
  };

  const avgAttendance = trend.length > 0
    ? Math.round(trend.reduce((s, d) => s + (d.value || 0), 0) / trend.length)
    : 0;

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Students", stats?.totalStudents ?? "N/A"],
      ["Total Staff", stats?.totalStaff ?? "N/A"],
      ["Meals Served Today", stats?.mealsServedToday ?? "N/A"],
      ["Avg Attendance (30d)", `${avgAttendance}%`],
      ["Food Waste %", `${stats?.foodWastePercent ?? 0}%`],
      ["Cost Saved Today", `₹${stats?.costSavedToday ?? 0}`],
      ["Feedback Score", stats?.feedbackScore ?? "N/A"],
      ["Total Feedback", feedSummary?.total ?? 0],
      ["Avg Rating", feedSummary?.averageRating ?? 0],
      ...mealDist.map(m => [m.label + " Attendance", `${m.value}% (${m.count} students)`]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartmess-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-emerald-600" /> Reports
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Generated on {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-60">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Summary */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Operational Summary</h2>
            </div>
            <StatRow label="Total Students" value={stats?.totalStudents?.toLocaleString("en-IN")} />
            <StatRow label="Total Staff" value={stats?.totalStaff} />
            <StatRow label="Meals Served Today" value={stats?.mealsServedToday} highlight />
            <StatRow label="Avg Attendance (30 days)" value={`${avgAttendance}%`} highlight />
            <StatRow label="Today's Attendance %" value={`${stats?.attendancePercentToday ?? 0}%`} />
          </div>

          {/* Food & Waste */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Food & Waste</h2>
            </div>
            <StatRow label="Food Waste %" value={`${stats?.foodWastePercent ?? 0}%`} />
            <StatRow label="Cost Saved Today" value={`₹${(stats?.costSavedToday ?? 0).toLocaleString("en-IN")}`} highlight />
            <StatRow label="AI Accuracy" value={`${stats?.aiAccuracy ?? 0}%`} />
            <StatRow label="AI Status" value={stats?.aiStatus ?? "—"} />
          </div>

          {/* Feedback */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Feedback Report</h2>
            </div>
            <StatRow label="Total Feedback" value={feedSummary?.total ?? 0} />
            <StatRow label="Average Rating" value={`${feedSummary?.averageRating ?? 0} / 5`} highlight />
            {(feedSummary?.bySentiment || []).map(({ _id, count }) => (
              <StatRow key={_id} label={`${_id} Reviews`} value={count}
                sub={`${Math.round((count / (feedSummary?.total || 1)) * 100)}% of total`} />
            ))}
          </div>

          {/* Meal Distribution */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-teal-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Today's Meal Distribution</h2>
            </div>
            {mealDist.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No attendance data yet today</p>
            ) : mealDist.map(m => (
              <StatRow key={m.label} label={m.label} value={`${m.value}%`}
                sub={`${m.count} students`} highlight={m.label === "Lunch"} />
            ))}
          </div>

          {/* 30-day Attendance Table */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">30-Day Attendance Log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs border-b border-slate-100">
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold">Day</th>
                    <th className="pb-2 font-semibold">Count</th>
                    <th className="pb-2 font-semibold">Attendance %</th>
                    <th className="pb-2 font-semibold">Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trend.slice().reverse().map((d, i) => (
                    <motion.tr key={d.date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                      className="hover:bg-slate-50/60">
                      <td className="py-2 text-slate-600 font-mono text-xs">{d.date}</td>
                      <td className="py-2 text-slate-500">{d.day}</td>
                      <td className="py-2 font-medium text-slate-800">{d.count}</td>
                      <td className="py-2">
                        <span className={`font-bold ${d.value >= 70 ? "text-emerald-600" : d.value >= 40 ? "text-amber-600" : "text-rose-500"}`}>
                          {d.value}%
                        </span>
                      </td>
                      <td className="py-2 w-32">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                            style={{ width: `${Math.min(d.value, 100)}%` }} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
