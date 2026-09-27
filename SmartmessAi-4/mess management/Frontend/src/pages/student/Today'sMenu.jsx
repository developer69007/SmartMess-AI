import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, UtensilsCrossed, Coffee, Sun, Moon, Calendar } from "lucide-react";
import menuService from "../../services/menuService";

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TodaysMenu() {
  const [todaysMenu, setTodaysMenu] = useState(null);
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const [todayRes, weekRes] = await Promise.allSettled([
          menuService.getTodaysMenu(),
          menuService.getWeeklyMenu(),
        ]);

        if (todayRes.status === "fulfilled") setTodaysMenu(todayRes.value.menu);
        if (weekRes.status === "fulfilled") setWeeklyMenus(weekRes.value.menus || []);
      } catch (err) {
        console.error("Menu fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const MealBlock = ({ mealType, meal, delay = 0 }) => {
    const Icon = mealIcons[mealType] || UtensilsCrossed;
    const colorMap = {
      breakfast: { icon: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", badge: "bg-amber-100 text-amber-700" },
      lunch: { icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", badge: "bg-emerald-100 text-emerald-700" },
      dinner: { icon: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", badge: "bg-indigo-100 text-indigo-700" },
    };
    const c = colorMap[mealType] || colorMap.lunch;

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={`rounded-2xl border ${c.border} bg-white p-5 shadow-sm`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.icon}`}>
            <Icon size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 capitalize">{mealType}</h3>
            <p className="text-xs text-slate-400">{meal?.time || "Time not set"}</p>
          </div>
          <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${
            meal?.isAvailable !== false ? c.badge : "bg-slate-100 text-slate-500"
          }`}>
            {meal?.isAvailable !== false ? "Available" : "Unavailable"}
          </span>
        </div>

        {meal?.items && meal.items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {meal.items.map((item, i) => (
              <span
                key={i}
                className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Menu not set for this meal</p>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Mess Menu</h1>
          <p className="mt-1 text-sm text-slate-400">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 rounded-xl p-1 w-fit">
          {["today", "week"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "today" ? "Today" : "This Week"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : activeTab === "today" ? (
          todaysMenu ? (
            <div className="space-y-4">
              {todaysMenu.meals?.breakfast && (
                <MealBlock mealType="breakfast" meal={todaysMenu.meals.breakfast} delay={0} />
              )}
              {todaysMenu.meals?.lunch && (
                <MealBlock mealType="lunch" meal={todaysMenu.meals.lunch} delay={0.1} />
              )}
              {todaysMenu.meals?.dinner && (
                <MealBlock mealType="dinner" meal={todaysMenu.meals.dinner} delay={0.2} />
              )}
              {todaysMenu.specialNote && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">
                    <span className="font-semibold">📢 Note: </span>
                    {todaysMenu.specialNote}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-medium">No menu set for today</p>
              <p className="text-slate-400 text-sm mt-1">Check back later or contact the mess admin.</p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {weeklyMenus.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">No weekly menu available</p>
              </div>
            ) : (
              weeklyMenus.map((dayMenu, i) => (
                <motion.div
                  key={dayMenu._id || i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-slate-900">{dayMenu.day}</h3>
                    <span className="text-xs text-slate-400">
                      {new Date(dayMenu.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    {new Date(dayMenu.date).toDateString() === new Date().toDateString() && (
                      <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Today</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {["breakfast", "lunch", "dinner"].map((meal) => (
                      <div key={meal} className="space-y-1">
                        <p className="font-medium text-slate-500 uppercase tracking-wide text-[10px]">{meal}</p>
                        <p className="text-slate-700 leading-snug">
                          {dayMenu.meals?.[meal]?.items?.slice(0, 2).join(", ") || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
    </div>
  );
}