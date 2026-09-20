import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck, Users, Coffee, Sun, Moon,
  CheckCircle2, Clock, Loader2, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";
function getToken() { return localStorage.getItem("token") || ""; }

const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: Coffee, color: "from-amber-400 to-orange-400" },
  { key: "lunch", label: "Lunch", icon: Sun, color: "from-emerald-500 to-teal-500" },
  { key: "dinner", label: "Dinner", icon: Moon, color: "from-indigo-500 to-blue-500" },
];

export default function StaffAttendance() {
  const [loading, setLoading] = useState(true);
  const [mealFilter, setMealFilter] = useState("all");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState({ breakfast: 0, lunch: 0, dinner: 0, total: 0 });
  const [records, setRecords] = useState([]);

  useEffect(() => { fetchAttendance(); }, [mealFilter]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const query = mealFilter !== "all" ? `?mealType=${mealFilter}` : "";
      const res = await fetch(`${API_BASE}/attendance/daily${query}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary || { breakfast: 0, lunch: 0, dinner: 0, total: 0 });
        setRecords(data.records || []);
      }
    } catch (err) {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" /> Today's Attendance
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button onClick={fetchAttendance} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: summary.total, icon: Users, color: "bg-slate-100 text-slate-700" },
          ...MEALS.map((m) => ({ label: m.label, value: summary[m.key], icon: m.icon, color: "bg-emerald-100 text-emerald-700" })),
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl mb-2 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter by meal */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setMealFilter("all")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${mealFilter === "all" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-100" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          All Meals
        </button>
        {MEALS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMealFilter(m.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all ${mealFilter === m.key ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-100" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <m.icon className="w-3.5 h-3.5" /> {m.label}
          </button>
        ))}
      </div>

      {/* Records table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-4 font-semibold">Student</th>
                <th className="px-5 py-4 font-semibold">Meal</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-400">
                  <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No attendance records yet</p>
                </td></tr>
              ) : records.map((rec, i) => (
                <motion.tr
                  key={rec._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {rec.student?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{rec.student?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-400">{rec.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="capitalize text-slate-600 font-medium">{rec.mealType}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${rec.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {rec.status === "present" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(rec.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
