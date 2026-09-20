import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Plus, Edit3, Trash2, Loader2, RefreshCw,
  Coffee, Sun, Moon, Calendar, CheckCircle2, X, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import menuService from "../../services/menuService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl my-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function MealItemsInput({ meal, value, onChange }) {
  const [input, setInput] = useState("");
  const Icon = MEAL_ICONS[meal];

  const addItem = () => {
    if (!input.trim()) return;
    onChange({ ...value, items: [...(value.items || []), input.trim()] });
    setInput("");
  };

  const removeItem = (i) =>
    onChange({ ...value, items: value.items.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${MEAL_COLORS[meal]} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-700 capitalize">{meal}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Time</label>
          <input
            value={value.time || ""}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            placeholder="e.g. 7:30 AM – 9:00 AM"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Available</label>
          <select
            value={value.isAvailable !== false ? "yes" : "no"}
            onChange={(e) => onChange({ ...value, isAvailable: e.target.value === "yes" })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="yes">Available</option>
            <option value="no">Unavailable</option>
          </select>
        </div>
      </div>
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Menu Items</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
        {(value.items || []).map((item, i) => (
          <span key={i} className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700">
            {item}
            <button onClick={() => removeItem(i)} className="text-emerald-500 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
          placeholder="Add item, press Enter"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-white text-xs font-semibold hover:bg-emerald-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayMenu, setTodayMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMenu, setEditMenu] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    day: DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
    specialNote: "",
    meals: {
      breakfast: { items: [], time: "7:30 AM – 9:00 AM", isAvailable: true },
      lunch: { items: [], time: "12:30 PM – 2:00 PM", isAvailable: true },
      dinner: { items: [], time: "7:30 PM – 9:00 PM", isAvailable: true },
    },
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [todayRes, weekRes] = await Promise.allSettled([
        menuService.getTodaysMenu(),
        menuService.getWeeklyMenu(),
      ]);
      if (todayRes.status === "fulfilled") setTodayMenu(todayRes.value.menu);
      if (weekRes.status === "fulfilled") setMenus(weekRes.value.menus || []);
    } catch (err) {
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (menu) => {
    setEditMenu(menu);
    setForm({
      date: new Date(menu.date).toISOString().split("T")[0],
      day: menu.day,
      specialNote: menu.specialNote || "",
      meals: {
        breakfast: menu.meals?.breakfast || { items: [], time: "7:30 AM – 9:00 AM", isAvailable: true },
        lunch: menu.meals?.lunch || { items: [], time: "12:30 PM – 2:00 PM", isAvailable: true },
        dinner: menu.meals?.dinner || { items: [], time: "7:30 PM – 9:00 PM", isAvailable: true },
      },
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditMenu(null);
    setForm({
      date: new Date().toISOString().split("T")[0],
      day: DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
      specialNote: "",
      meals: {
        breakfast: { items: [], time: "7:30 AM – 9:00 AM", isAvailable: true },
        lunch: { items: [], time: "12:30 PM – 2:00 PM", isAvailable: true },
        dinner: { items: [], time: "7:30 PM – 9:00 PM", isAvailable: true },
      },
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      let data;
      if (editMenu) {
        data = await menuService.updateMenu(editMenu._id, form.meals);
      } else {
        data = await menuService.createMenu(form);
      }
      if (data.success) {
        toast.success(editMenu ? "Menu updated!" : "Menu created!");
        setShowModal(false);
        fetchAll();
      } else {
        toast.error(data.message || "Failed to save menu");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" /> Menu Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Create and manage the weekly mess menu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add Menu
          </button>
        </div>
      </div>

      {/* Today's menu highlight */}
      {todayMenu && (
        <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">Today — {todayMenu.day}</span>
            <span className="ml-auto rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">Live</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MEALS.map((meal) => {
              const m = todayMenu.meals?.[meal];
              const Icon = MEAL_ICONS[meal];
              return (
                <div key={meal} className="rounded-2xl bg-white p-3 border border-emerald-100">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2 py-0.5 mb-2 bg-gradient-to-r ${MEAL_COLORS[meal]} text-white capitalize`}>
                    <Icon className="w-3 h-3" /> {meal}
                  </div>
                  {m?.items?.length > 0 ? (
                    <ul className="space-y-0.5">
                      {m.items.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />{item}
                        </li>
                      ))}
                      {m.items.length > 3 && <li className="text-xs text-slate-400">+{m.items.length - 3} more</li>}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Not set</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => openEdit(todayMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Today's Menu
            </button>
          </div>
        </div>
      )}

      {/* Weekly menu cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {menus.map((menu, i) => {
            const isToday = new Date(menu.date).toDateString() === new Date().toDateString();
            return (
              <motion.div
                key={menu._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-3xl border bg-white p-5 shadow-sm ${isToday ? "border-emerald-300" : "border-slate-200"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800">{menu.day}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(menu.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isToday && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">Today</span>}
                    <button onClick={() => openEdit(menu)} className="rounded-lg p-1.5 border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {MEALS.map((meal) => {
                    const m = menu.meals?.[meal];
                    const Icon = MEAL_ICONS[meal];
                    return (
                      <div key={meal} className="flex items-start gap-2">
                        <div className={`shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br ${MEAL_COLORS[meal]} flex items-center justify-center mt-0.5`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {m?.items?.slice(0, 3).join(", ") || <span className="text-slate-300 italic">Not set</span>}
                          {m?.items?.length > 3 && <span className="text-slate-400"> +{m.items.length - 3}</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {menu.specialNote && (
                  <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{menu.specialNote}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
          {menus.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No menus for this week. Click "Add Menu" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} title={editMenu ? "Edit Menu" : "Create New Menu"} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editMenu && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Day</label>
                <select
                  value={form.day}
                  onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}
          {MEALS.map((meal) => (
            <MealItemsInput
              key={meal}
              meal={meal}
              value={form.meals[meal]}
              onChange={(val) => setForm((p) => ({ ...p, meals: { ...p.meals, [meal]: val } }))}
            />
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Special Note (optional)</label>
            <input
              value={form.specialNote}
              onChange={(e) => setForm((p) => ({ ...p, specialNote: e.target.value }))}
              placeholder="e.g. Special sweet served tonight"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-200 disabled:opacity-60 hover:scale-[1.01] transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {editMenu ? "Save Changes" : "Create Menu"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
