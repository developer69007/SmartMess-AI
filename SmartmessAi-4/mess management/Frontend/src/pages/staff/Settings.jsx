import { useState } from "react";
import { Settings, Bell, Shield, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SECTIONS = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    color: "bg-blue-100 text-blue-600",
    settings: [
      { id: "feedbackAlert", label: "Feedback Alerts", sub: "Notify when new feedback is submitted", default: true },
      { id: "attendanceAlert", label: "Attendance Alerts", sub: "Alert if scan rate drops suddenly", default: false },
      { id: "shiftReminder", label: "Shift Reminders", sub: "Receive reminders before shift starts", default: true },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    color: "bg-emerald-100 text-emerald-600",
    settings: [
      { id: "sessionAlert", label: "New Login Alerts", sub: "Notify on login from new device", default: true },
    ],
  },
];

function Toggle({ enabled, onChange }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`relative flex items-center rounded-full transition-all duration-300 ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}
      style={{ height: "22px", width: "42px" }}>
      <span className={`absolute w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${enabled ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

export default function StaffSettings() {
  const initial = Object.fromEntries(
    SECTIONS.flatMap(s => s.settings.map(st => [st.id, st.default]))
  );
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setValues(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(r => setTimeout(r, 700));
      toast.success("Settings saved!");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" /> Settings
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your staff account preferences</p>
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
