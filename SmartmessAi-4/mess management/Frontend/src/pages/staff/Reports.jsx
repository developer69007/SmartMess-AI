import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart, Download, Calendar, CalendarCheck,
  Coffee, Sun, Moon, Users, Loader2, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import analyticsService from "../../services/analyticsService";

const MEALS = ["breakfast", "lunch", "dinner"];
const MEAL_ICONS = { breakfast: Coffee, lunch: Sun, dinner: Moon };
const MEAL_COLORS = {
  breakfast: "from-amber-400 to-orange-400",
  lunch: "from-emerald-500 to-teal-500",
  dinner: "from-indigo-500 to-blue-500",
};

export default function StaffReports() {
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState([]);
  const [mealDist, setMealDist] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [sRes, tRes, mRes] = await Promise.allSettled([
        analyticsService.getStaffDashboardStats(),
        analyticsService.getAttendanceTrend(14),
        analyticsService.getMealDistribution(),
      ]);
      if (sRes.status === "fulfilled" && sRes.value.success) setStats(sRes.value.stats);
      if (tRes.status === "fulfilled" && tRes.value.success) setTrend(tRes.value.trend);
      if (mRes.status === "fulfilled" && mRes.value.success) setMealDist(mRes.value.distribution);
    } catch { toast.error("Failed to load report data"); }
    finally { setLoading(false); }
  };

  const avgAttendance = trend.length > 0
    ? Math.round(trend.reduce((s, d) => s + (d.value || 0), 0) / trend.length)
    : 0;

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Meals Prepped Today", stats?.mealsPreppedToday ?? "N/A"],
      ["Students Served Today", stats?.studentsServedToday ?? "N/A"],
      ["QR Scans Today", stats?.qrScansToday ?? "N/A"],
      ["Avg Attendance (14d)", `${avgAttendance}%`],
      ...mealDist.map(m => [m.label + " Attendance", `${m.value}% (${m.count} students)`]),
      ...trend.map(d => [d.date, `${d.value}%`]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-emerald-600" /> Daily Report
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 disabled:opacity-60">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Meals Prepped", value: stats?.mealsPreppedToday ?? 0, icon: CalendarCheck, color: "bg-teal-100 text-teal-700" },
              { label: "Students Served", value: stats?.studentsServedToday ?? 0, icon: Users, color: "bg-emerald-100 text-emerald-700" },
              { label: "QR Scans", value: stats?.qrScansToday ?? 0, icon: CalendarCheck, color: "bg-indigo-100 text-indigo-700" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl mb-2 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Meal Distribution */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Today's Meal Distribution</h2>
            <div className="space-y-5">
              {mealDist.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No data yet for today</p>
              ) : mealDist.map(({ label, value, count }) => {
                const meal = label.toLowerCase();
                const Icon = MEAL_ICONS[meal];
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${MEAL_COLORS[meal]} flex items-center justify-center`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                        <span className="text-xs text-slate-400">{count} students</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{value}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(value, 100)}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full bg-gradient-to-r ${MEAL_COLORS[meal]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 14-Day Attendance Table */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">14-Day Attendance Log</h2>
              <span className="text-xs text-slate-400">Avg: <strong className="text-emerald-600">{avgAttendance}%</strong></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs border-b border-slate-100">
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold">Day</th>
                    <th className="pb-2 font-semibold">Count</th>
                    <th className="pb-2 font-semibold">%</th>
                    <th className="pb-2 font-semibold">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trend.slice().reverse().map((d, i) => (
                    <motion.tr key={d.date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50/60">
                      <td className="py-2.5 text-slate-500 font-mono text-xs">{d.date}</td>
                      <td className="py-2.5 text-slate-600">{d.day}</td>
                      <td className="py-2.5 font-medium text-slate-800">{d.count}</td>
                      <td className="py-2.5">
                        <span className={`font-bold text-xs ${d.value >= 70 ? "text-emerald-600" : d.value >= 40 ? "text-amber-500" : "text-rose-500"}`}>
                          {d.value}%
                        </span>
                      </td>
                      <td className="py-2.5 w-28">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
