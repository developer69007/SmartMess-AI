import { useState } from "react";
import {
  Settings, Bell, Shield, Palette, Database,
  Save, Loader2, ToggleLeft, ToggleRight, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

const SECTIONS = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    color: "bg-blue-100 text-blue-600",
    settings: [
      { id: "emailAlerts", label: "Email Alerts", sub: "Receive alerts for low attendance", default: true },
      { id: "feedbackAlerts", label: "Feedback Alerts", sub: "Notify on new negative reviews", default: true },
      { id: "wasteAlerts", label: "Food Waste Alerts", sub: "Alert when waste exceeds threshold", default: false },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    color: "bg-emerald-100 text-emerald-600",
    settings: [
      { id: "twoFactor", label: "Two-Factor Auth", sub: "Extra security for admin login", default: false },
      { id: "sessionLog", label: "Session Logging", sub: "Log all admin login events", default: true },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Database,
    color: "bg-slate-100 text-slate-600",
    settings: [
      { id: "autoBackup", label: "Auto Backup", sub: "Daily MongoDB snapshot", default: true },
      { id: "maintenanceMode", label: "Maintenance Mode", sub: "Disable student access temporarily", default: false },
    ],
  },
];

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-300 flex items-center ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}
      style={{ height: "22px", width: "42px" }}
    >
      <span className={`absolute w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${enabled ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

export default function AdminSettings() {
  const initial = Object.fromEntries(
    SECTIONS.flatMap(s => s.settings.map(st => [st.id, st.default]))
  );
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [attendanceThreshold, setAttendanceThreshold] = useState(70);
  const [wasteThreshold, setWasteThreshold] = useState(20);

  const set = (key, val) => setValues(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(r => setTimeout(r, 800)); // Simulate save
      toast.success("Settings saved!");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" /> Settings
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure system-wide preferences</p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map(({ id, label, icon: Icon, color, settings }) => (
            <div key={id} className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</h2>
              </div>
              <div className="space-y-4">
                {settings.map(({ id: sid, label: slabel, sub }) => (
                  <div key={sid} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{slabel}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    </div>
                    <Toggle enabled={values[sid]} onChange={v => set(sid, v)} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Thresholds */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                <Palette className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Thresholds</h2>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-800">Low Attendance Alert</label>
                  <span className="text-sm font-bold text-emerald-700">{attendanceThreshold}%</span>
                </div>
                <input type="range" min={30} max={90} value={attendanceThreshold}
                  onChange={e => setAttendanceThreshold(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-emerald-600 bg-slate-100" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>30%</span><span>90%</span></div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-800">Food Waste Alert</label>
                  <span className="text-sm font-bold text-rose-600">{wasteThreshold}%</span>
                </div>
                <input type="range" min={5} max={50} value={wasteThreshold}
                  onChange={e => setWasteThreshold(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-rose-500 bg-slate-100" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5%</span><span>50%</span></div>
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-60 transition-all hover:scale-[1.01]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
