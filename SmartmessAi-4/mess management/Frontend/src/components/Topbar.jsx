import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Today's Special: Paneer Butter Masala",
    time: "10 min ago",
  },
  {
    id: 2,
    title: "Mess timing updated for Sunday lunch",
    time: "1 hr ago",
  },
  {
    id: 3,
    title: "AI food waste reduction activated",
    time: "3 hr ago",
  },
];

export default function Topbar({ studentName = "Student", onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/60 bg-white/70 px-4 sm:px-6 py-4 backdrop-blur-xl">
      {/* Left Greeting & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden rounded-xl p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Good Morning, {studentName} <span className="inline-block">👋</span>
          </h1>
          <p className="hidden sm:block text-xs text-slate-400">
            {today} · Welcome to your SmartMess portal
          </p>
        </div>
      </div>

      {/* Right Cluster */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search menu, meals..."
            className="w-48 rounded-2xl border border-slate-200 bg-white/80 py-2 pl-9 pr-4 text-xs text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:w-60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600 shadow-sm"
          >
            <Bell size={17} strokeWidth={2} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-xl backdrop-blur-xl z-50"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                  </div>
                  <ul>
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className="cursor-pointer border-b border-slate-50 px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-emerald-50/60"
                      >
                        <p className="text-xs font-medium text-slate-700">{n.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{n.time}</p>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 py-1.5 pl-1.5 pr-2.5 shadow-sm transition-all hover:bg-emerald-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-bold text-white shadow-sm">
              {studentName.charAt(0)}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-slate-700">
              {studentName}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-xl backdrop-blur-xl z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || studentName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || "student@smartmess.ai"}</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/student/profile");
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>My Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/student/settings");
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}