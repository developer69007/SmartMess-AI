import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Users, UtensilsCrossed,
  Star, Trash2, Loader2, RefreshCw, Calendar
} from "lucide-react";
import analyticsService from "../../services/analyticsService";

const MEAL_COLORS = {
  Breakfast: { bar: "from-amber-400 to-orange-400", bg: "bg-amber-50", text: "text-amber-700" },
  Lunch: { bar: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  Dinner: { bar: "from-indigo-400 to-blue-500", bg: "bg-indigo-50", text: "text-indigo-700" },
};

const SENTIMENT_COLORS = {
  Positive: { bar: "from-emerald-400 to-teal-500", bg: "bg-emerald-100", text: "text-emerald-700" },
  Neutral: { bar: "from-slate-300 to-slate-400", bg: "bg-slate-100", text: "text-slate-600" },
  Negative: { bar: "from-rose-400 to-red-500", bg: "bg-rose-100", text: "text-rose-700" },
};

function StatBlock({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className={`inline-flex items-center justify-center h-11 w-11 rounded-2xl mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value ?? "—"}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [mealDist, setMealDist] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, trendRes, mealRes, feedRes] = await Promise.allSettled([
        analyticsService.getAdminDashboardStats(),
        analyticsService.getAttendanceTrend(14),
        analyticsService.getMealDistribution(),
        analyticsService.getFeedbackSummary(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.success) setStats(statsRes.value.stats);
      if (trendRes.status === "fulfilled" && trendRes.value.success) setTrend(trendRes.value.trend);
      if (mealRes.status === "fulfilled" && mealRes.value.success) setMealDist(mealRes.value.distribution);
      if (feedRes.status === "fulfilled" && feedRes.value.success) setFeedbackSummary(feedRes.value.summary);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxTrendVal = trend.reduce((max, d) => Math.max(max, d.value || d.count || 0), 1);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" /> Analytics & Insights
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time data from your mess operations</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBlock label="Total Students" value={stats?.totalStudents?.toLocaleString("en-IN")} icon={Users} color="bg-emerald-100 text-emerald-700" />
        <StatBlock label="Meals Served Today" value={stats?.mealsServedToday} icon={UtensilsCrossed} color="bg-teal-100 text-teal-700" />
        <StatBlock label="Feedback Score" value={stats?.feedbackScore} icon={Star} color="bg-amber-100 text-amber-700" />
        <StatBlock label="Food Waste %" value={`${stats?.foodWastePercent ?? 0}%`} icon={Trash2} color="bg-rose-100 text-rose-700" sub={`₹${(stats?.costSavedToday ?? 0).toLocaleString("en-IN")} saved`} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Attendance Trend (14-day) */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">Attendance Trend</h2>
                <p className="text-xs text-slate-400 mt-0.5">Last 14 days</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                {trend.length > 1 && trend[trend.length - 1].value > trend[0].value ? "Improving" : "Stable"}
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-40">
              {trend.map(({ day, value, count }) => {
                const barHeight = Math.max(4, ((value || count || 0) / maxTrendVal) * 100);
                const isToday = day === new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);
                return (
                  <div key={day + (value || count)} className="flex flex-col items-center gap-1 flex-1 group relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                      {value || count}%
                    </div>
                    <div className="w-full flex items-end h-36 rounded-lg bg-slate-100 overflow-hidden">
                      <div
                        className={`w-full rounded-lg bg-gradient-to-t ${isToday ? "from-emerald-600 to-teal-500" : "from-emerald-400 to-teal-300"} transition-all duration-700`}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? "text-emerald-600" : "text-slate-400"}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meal Distribution + Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Meal Distribution */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-1">Today's Meal Distribution</h2>
              <p className="text-xs text-slate-400 mb-5">Attendance per meal today</p>
              <div className="space-y-5">
                {mealDist.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No attendance data yet today</p>
                ) : mealDist.map(({ label, value, count }) => {
                  const cfg = MEAL_COLORS[label] || MEAL_COLORS.Lunch;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${cfg.bg} ${cfg.text}`}>{label}</span>
                          <span className="text-xs text-slate-400">{count} students</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{value}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(value, 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-1">Feedback Summary</h2>
              <p className="text-xs text-slate-400 mb-4">Overall sentiment from student reviews</p>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 rounded-2xl bg-amber-50 flex flex-col items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400 mb-0.5" />
                  <p className="text-lg font-bold text-slate-900">{feedbackSummary?.averageRating ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Average Rating</p>
                  <p className="text-xs text-slate-400">From {feedbackSummary?.total ?? 0} total reviews</p>
                </div>
              </div>
              <div className="space-y-3">
                {(feedbackSummary?.bySentiment || []).map(({ _id: sentiment, count }) => {
                  const total = feedbackSummary?.total || 1;
                  const pct = Math.round((count / total) * 100);
                  const cfg = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.Neutral;
                  return (
                    <div key={sentiment}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className={`font-semibold rounded-full px-2 py-0.5 ${cfg.bg} ${cfg.text}`}>{sentiment}</span>
                        <span className="font-bold text-slate-700">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7 }}
                          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Recent feedback list */}
              {feedbackSummary?.recent?.length > 0 && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent Reviews</p>
                  {feedbackSummary.recent.slice(0, 3).map((f, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">{f.studentName}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                          ))}
                        </div>
                      </div>
                      {f.comment && <p className="text-xs text-slate-500 line-clamp-1">{f.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
