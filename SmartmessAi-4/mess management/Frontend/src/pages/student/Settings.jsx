import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Moon, Smartphone, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const SettingRow = ({ icon: Icon, title, subtitle, action, value, onToggle }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {onToggle ? (
      <button
        onClick={onToggle}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none ${
          value ? "bg-emerald-500" : "bg-slate-200"
        }`}
        style={{ height: "1.375rem", minWidth: "2.5rem" }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    ) : (
      <ChevronRight size={16} className="text-slate-400" />
    )}
  </div>
);

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const sections = [
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          title: "Push Notifications",
          subtitle: "Get notified about mess updates",
          value: notifications,
          onToggle: () => setNotifications((p) => !p),
        },
        {
          icon: Moon,
          title: "Dark Mode",
          subtitle: "Switch to dark theme",
          value: darkMode,
          onToggle: () => {
            setDarkMode((p) => !p);
            toast("Dark mode coming soon!", { icon: "🌙" });
          },
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          icon: Smartphone,
          title: "Biometric Login",
          subtitle: "Use fingerprint or Face ID",
          value: biometrics,
          onToggle: () => {
            setBiometrics((p) => !p);
            toast("Biometric login coming soon!", { icon: "🔑" });
          },
        },
        {
          icon: Shield,
          title: "Privacy Policy",
          subtitle: "SmartMess AI data policy",
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your SmartMess AI preferences</p>
        </div>

        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {section.items.map((item) => (
                <SettingRow key={item.title} {...item} />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm transition-all hover:bg-red-100 hover:scale-[1.01] active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>

        <p className="text-center text-xs text-slate-400">SmartMess AI v1.0 — Hackathon Edition</p>
      </main>
    </div>
  );
}