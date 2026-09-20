import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChefHat, Thermometer, Flame, Droplet, CheckCircle2,
  Clock, AlertCircle, RefreshCw, Save, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import staffService from "../../services/staffService";

const STATUS_OPTIONS = {
  cookingStatus: ["Not Started", "In Progress", "Completed"],
  cleaningStatus: ["Pending", "In Progress", "Completed"],
  gasStatus: ["Normal", "Low", "Critical"],
  waterStatus: ["Available", "Low", "Unavailable"],
};

const statusColors = {
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "In Progress": "bg-cyan-100 text-cyan-700 border-cyan-200",
  Normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "Not Started": "bg-slate-100 text-slate-600 border-slate-200",
  Low: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-rose-100 text-rose-700 border-rose-200",
  Unavailable: "bg-rose-100 text-rose-700 border-rose-200",
};

const StatusIcon = ({ value }) => {
  if (["Completed", "Normal", "Available"].includes(value)) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (["In Progress"].includes(value)) return <Clock className="w-4 h-4 text-cyan-500" />;
  if (["Critical", "Unavailable"].includes(value)) return <AlertCircle className="w-4 h-4 text-rose-500" />;
  return <Clock className="w-4 h-4 text-amber-500" />;
};

export default function KitchenStatus() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [form, setForm] = useState({
    temperature: "24°C",
    cookingStatus: "Not Started",
    preparingMeal: "",
    cleaningStatus: "Pending",
    gasStatus: "Normal",
    waterStatus: "Available",
    notes: "",
  });

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await staffService.getKitchenStatus();
      if (data.success) {
        const s = data.status;
        setIsDefault(data.isDefault || false);
        setForm({
          temperature: s.temperature || "24°C",
          cookingStatus: s.cookingStatus || "Not Started",
          preparingMeal: s.preparingMeal || "",
          cleaningStatus: s.cleaningStatus || "Pending",
          gasStatus: s.gasStatus || "Normal",
          waterStatus: s.waterStatus || "Available",
          notes: s.notes || "",
        });
      }
    } catch (err) {
      toast.error("Failed to load kitchen status");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await staffService.updateKitchenStatus(form);
      if (data.success) {
        toast.success("Kitchen status updated!");
        setIsDefault(false);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  const statusFields = [
    { key: "cookingStatus", label: "Cooking Status", icon: ChefHat },
    { key: "cleaningStatus", label: "Cleaning Status", icon: CheckCircle2 },
    { key: "gasStatus", label: "Gas Supply", icon: Flame },
    { key: "waterStatus", label: "Water Supply", icon: Droplet },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-emerald-600" /> Kitchen Status
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isDefault ? "No status set today — showing defaults" : "Today's kitchen operational status"}
          </p>
        </div>
        <button onClick={fetchStatus} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Status cards grid */}
        <div className="grid grid-cols-2 gap-4">
          {statusFields.map(({ key, label, icon: Icon }) => (
            <div key={key} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold mb-3 ${statusColors[form[key]] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                <StatusIcon value={form[key]} />
                {form[key]}
              </div>
              <select
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {STATUS_OPTIONS[key].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Temperature & Preparing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temperature</span>
            </div>
            <input
              value={form.temperature}
              onChange={(e) => setForm((p) => ({ ...p, temperature: e.target.value }))}
              placeholder="e.g. 24°C"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preparing</span>
            </div>
            <input
              value={form.preparingMeal}
              onChange={(e) => setForm((p) => ({ ...p, preparingMeal: e.target.value }))}
              placeholder="e.g. Lunch"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes / Remarks</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Any special notes for today..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
          />
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-60 transition-all hover:scale-[1.01]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Update Kitchen Status"}
        </motion.button>
      </div>
    </div>
  );
}
