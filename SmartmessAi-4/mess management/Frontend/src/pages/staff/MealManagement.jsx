import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Coffee, Sun, Moon, Edit3, Plus, Loader2, RefreshCw,
  CheckCircle2, X, AlertCircle, Calendar, ChefHat
} from "lucide-react";
import toast from "react-hot-toast";
import menuService from "../../services/menuService";

const MEALS = ["breakfast", "lunch", "dinner"];
const MEAL_ICONS = { breakfast: Coffee, lunch: Sun, dinner: Moon };
const MEAL_COLORS = {
  breakfast: "from-amber-400 to-orange-400",
  lunch: "from-emerald-500 to-teal-500",
  dinner: "from-indigo-500 to-blue-500",
};

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function MealManagement() {
  const [loading, setLoading] = useState(true);
  const [todayMenu, setTodayMenu] = useState(null);
  const [weekMenus, setWeekMenus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMenu, setEditMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mealEdits, setMealEdits] = useState({
    breakfast: { items: [], time: "7:30 AM – 9:00 AM", isAvailable: true },
    lunch: { items: [], time: "12:30 PM – 2:00 PM", isAvailable: true },
    dinner: { items: [], time: "7:30 PM – 9:00 PM", isAvailable: true },
  });
  const [newItem, setNewItem] = useState({ breakfast: "", lunch: "", dinner: "" });

  useEffect(() => { fetchMenus(); }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const [todayRes, weekRes] = await Promise.allSettled([
        menuService.getTodaysMenu(),
        menuService.getWeeklyMenu(),
      ]);
      if (todayRes.status === "fulfilled") setTodayMenu(todayRes.value.menu);
      if (weekRes.status === "fulfilled") setWeekMenus(weekRes.value.menus || []);
    } catch { toast.error("Failed to load menus"); }
    finally { setLoading(false); }
  };

  const openEdit = (menu) => {
    setEditMenu(menu);
    setMealEdits({
      breakfast: menu.meals?.breakfast || { items: [], time: "7:30 AM – 9:00 AM", isAvailable: true },
      lunch: menu.meals?.lunch || { items: [], time: "12:30 PM – 2:00 PM", isAvailable: true },
      dinner: menu.meals?.dinner || { items: [], time: "7:30 PM – 9:00 PM", isAvailable: true },
    });
    setShowModal(true);
  };

  const addItem = (meal) => {
    const item = newItem[meal].trim();
    if (!item) return;
    setMealEdits(p => ({ ...p, [meal]: { ...p[meal], items: [...(p[meal].items || []), item] } }));
    setNewItem(p => ({ ...p, [meal]: "" }));
  };

  const removeItem = (meal, idx) => {
    setMealEdits(p => ({ ...p, [meal]: { ...p[meal], items: p[meal].items.filter((_, i) => i !== idx) } }));
  };

  const handleSave = async () => {
    if (!editMenu) return;
    try {
      setSaving(true);
      const { data } = await (menuService.updateMenu(editMenu._id, mealEdits));
      if (data?.success) {
        toast.success("Menu updated!");
        setShowModal(false);
        fetchMenus();
      } else {
        toast.error("Update failed");
      }
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-emerald-600" /> Meal Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">View and update today's meal menu</p>
        </div>
        <button onClick={fetchMenus} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Today's Meals */}
          {todayMenu ? (
            <div className="rounded-3xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">Today — {todayMenu.day}</span>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">Live</span>
                </div>
                <button onClick={() => openEdit(todayMenu)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MEALS.map(meal => {
                  const m = todayMenu.meals?.[meal];
                  const Icon = MEAL_ICONS[meal];
                  return (
                    <div key={meal} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 mb-3 bg-gradient-to-r ${MEAL_COLORS[meal]} text-white capitalize`}>
                        <Icon className="w-3 h-3" /> {meal}
                      </div>
                      {m?.time && <p className="text-[10px] text-slate-400 mb-2">{m.time}</p>}
                      {m?.items?.length > 0 ? (
                        <ul className="space-y-1">
                          {m.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />{item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-300 italic">Not set</p>
                      )}
                      <div className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${m?.isAvailable !== false ? "text-emerald-600" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {m?.isAvailable !== false ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  );
                })}
              </div>
              {todayMenu.specialNote && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{todayMenu.specialNote}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <ChefHat className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">No menu set for today</p>
              <p className="text-xs text-slate-400 mt-1">Contact admin to create today's menu</p>
            </div>
          )}

          {/* Rest of the week */}
          {weekMenus.filter(m => m._id !== todayMenu?._id).length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">This Week</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {weekMenus.filter(m => m._id !== todayMenu?._id).map((menu, i) => (
                  <motion.div key={menu._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-800">{menu.day}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(menu.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <button onClick={() => openEdit(menu)}
                        className="rounded-lg p-1.5 border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {MEALS.map(meal => {
                        const m = menu.meals?.[meal];
                        const Icon = MEAL_ICONS[meal];
                        return (
                          <div key={meal} className="flex items-start gap-1.5">
                            <div className={`shrink-0 w-5 h-5 rounded-md bg-gradient-to-br ${MEAL_COLORS[meal]} flex items-center justify-center mt-0.5`}>
                              <Icon className="w-2.5 h-2.5 text-white" />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-1">
                              {m?.items?.slice(0, 3).join(", ") || <span className="text-slate-300 italic">Not set</span>}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={showModal} title={`Edit Menu — ${editMenu?.day}`} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          {MEALS.map(meal => {
            const Icon = MEAL_ICONS[meal];
            return (
              <div key={meal} className="rounded-2xl border border-slate-200 p-4">
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2 py-0.5 mb-3 bg-gradient-to-r ${MEAL_COLORS[meal]} text-white capitalize`}>
                  <Icon className="w-3 h-3" /> {meal}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Time</label>
                    <input value={mealEdits[meal]?.time || ""}
                      onChange={e => setMealEdits(p => ({ ...p, [meal]: { ...p[meal], time: e.target.value } }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</label>
                    <select value={mealEdits[meal]?.isAvailable !== false ? "yes" : "no"}
                      onChange={e => setMealEdits(p => ({ ...p, [meal]: { ...p[meal], isAvailable: e.target.value === "yes" } }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                      <option value="yes">Available</option>
                      <option value="no">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[20px]">
                  {(mealEdits[meal]?.items || []).map((item, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700">
                      {item}
                      <button onClick={() => removeItem(meal, i)} className="text-emerald-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input value={newItem[meal]}
                    onChange={e => setNewItem(p => ({ ...p, [meal]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem(meal))}
                    placeholder="Add item, press Enter"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  <button onClick={() => addItem(meal)} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white font-semibold hover:bg-emerald-700">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Menu"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
