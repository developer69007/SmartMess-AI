import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  UtensilsCrossed,
  Leaf,
  Sparkles,
  QrCode,
  MessageSquareText,
  Loader2,
} from "lucide-react";

import StatCard from "../../components/StatCard";
import MenuCard from "../../components/MenuCard";
import PredictionCard from "../../components/PredictionCard";
import QRCard from "../../components/QRCard";
import NotificationCard from "../../components/NotificationCard";
import ChartCard from "../../components/ChartCard";
import Stats from "../../components/Stats";

import { useAuth } from "../../context/AuthContext.jsx";
import menuService from "../../services/menuService";
import attendanceService from "../../services/attendanceService";
import analyticsService from "../../services/analyticsService";

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ─── State ───────────────────────────────────────────────────────────────
  const [todaysMenu, setTodaysMenu] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [stats, setStats] = useState({
    attendancePercent: 0,
    mealsToday: 0,
    foodSavedKg: 0,
    aiAccuracy: 96.4,
  });
  const [loading, setLoading] = useState(true);

  // ─── Fetch dashboard data ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Run all fetches in parallel
        const [menuRes, attendanceRes] = await Promise.allSettled([
          menuService.getTodaysMenu(),
          attendanceService.getMyAttendance(),
        ]);

        // Today's menu
        if (menuRes.status === "fulfilled" && menuRes.value.menu) {
          const menu = menuRes.value.menu;
          const formatted = [];

          if (menu.meals?.breakfast) {
            formatted.push({
              mealType: "Breakfast",
              mealName: menu.meals.breakfast.items?.join(", ") || "See menu",
              servingTime: menu.meals.breakfast.time || "7:30 AM – 9:00 AM",
              available: menu.meals.breakfast.isAvailable !== false,
            });
          }
          if (menu.meals?.lunch) {
            formatted.push({
              mealType: "Lunch",
              mealName: menu.meals.lunch.items?.join(", ") || "See menu",
              servingTime: menu.meals.lunch.time || "12:30 PM – 2:00 PM",
              available: menu.meals.lunch.isAvailable !== false,
            });
          }
          if (menu.meals?.dinner) {
            formatted.push({
              mealType: "Dinner",
              mealName: menu.meals.dinner.items?.join(", ") || "See menu",
              servingTime: menu.meals.dinner.time || "7:30 PM – 9:00 PM",
              available: menu.meals.dinner.isAvailable !== false,
            });
          }
          setTodaysMenu(formatted);
        }

        // Attendance stats + recent activity
        if (attendanceRes.status === "fulfilled") {
          const attData = attendanceRes.value;
          setStats((prev) => ({
            ...prev,
            attendancePercent: attData.attendancePercentage || 0,
            mealsToday: attData.records?.filter((r) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return new Date(r.date) >= today;
            }).length || 0,
          }));

          // Build recent activity from last 3 attendance records
          const recent = (attData.records || []).slice(0, 3).map((r, i) => ({
            id: r._id || i,
            title: "QR Attendance Marked",
            detail: `${r.mealType?.charAt(0).toUpperCase() + r.mealType?.slice(1)} – Mess Hall`,
            time: new Date(r.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            }),
            icon: QrCode,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          }));
          setRecentAttendance(recent);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ─── Stat cards (dynamic) ─────────────────────────────────────────────────
  const statCards = [
    {
      label: "My Attendance",
      value: stats.attendancePercent,
      suffix: "%",
      icon: CalendarCheck,
      accent: "emerald",
    },
    {
      label: "Meals Today",
      value: stats.mealsToday,
      suffix: "",
      icon: UtensilsCrossed,
      accent: "teal",
    },
    {
      label: "Food Saved",
      value: 18,
      suffix: " kg",
      icon: Leaf,
      accent: "green",
    },
    {
      label: "AI Accuracy",
      value: stats.aiAccuracy,
      suffix: "%",
      decimals: 1,
      icon: Sparkles,
      accent: "emerald",
    },
  ];

  // ─── Fallback menu while loading ──────────────────────────────────────────
  const displayMenu =
    todaysMenu.length > 0
      ? todaysMenu
      : [
          { mealType: "Breakfast", mealName: "Loading...", servingTime: "7:30 AM – 9:00 AM", available: true },
          { mealType: "Lunch", mealName: "Loading...", servingTime: "12:30 PM – 2:00 PM", available: true },
          { mealType: "Dinner", mealName: "Loading...", servingTime: "7:30 PM – 9:00 PM", available: false },
        ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stat Cards */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 0.08} />
          ))}
        </section>

        {/* Today's Menu + AI Prediction */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeading
              title="Today's Menu"
              subtitle="Breakfast, lunch and dinner at a glance"
            />
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {displayMenu.map((meal, i) => (
                  <MenuCard key={meal.mealType} {...meal} delay={i * 0.1} />
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionHeading
              title="AI Prediction"
              subtitle="Forecast for today's mess turnout"
            />
            <PredictionCard confidence={94.6} />
          </div>
        </section>

        {/* QR Scanner + Notifications */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <SectionHeading title="Mark Attendance" />
            {/* Use real student ID from auth context */}
            <QRCard
              studentId={user?.id || user?._id || "LOADING"}
              onScan={() => navigate("/student/scanner")}
            />
          </div>

          <div className="lg:col-span-2">
            <SectionHeading title="Notifications" subtitle="Stay updated" />
            <NotificationCard />
          </div>
        </section>

        {/* Charts */}
        <section>
          <SectionHeading
            title="Insights"
            subtitle="Weekly attendance and food consumption trends"
          />
          <ChartCard />
        </section>

        {/* Stats */}
        <section className="-mx-4 sm:-mx-6 lg:-mx-8">
          <Stats />
        </section>

        {/* Recent Activity */}
        <section>
          <SectionHeading
            title="Recent Activity"
            subtitle="Your latest actions in the mess"
          />
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              </div>
            ) : recentAttendance.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">
                No recent activity yet. Start by marking your attendance!
              </p>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                      whileHover={{ x: 3 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 transition-colors duration-200 hover:bg-emerald-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activity.bg} ${activity.color}`}
                        >
                          <Icon size={16} strokeWidth={2.1} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {activity.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {activity.detail}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-400">
                        {activity.time}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
    </div>
  );
}