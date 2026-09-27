import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Today's Special: Paneer Butter Masala",
    time: "10 min ago",
  },
  {
    id: 2,
    title: "Mess timing updated for tomorrow",
    time: "1 hr ago",
  },
  {
    id: 3,
    title: "Maintenance scheduled at Block C mess",
    time: "3 hr ago",
  },
];

export default function Topbar({ studentName = "Student" }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/70 px-6 py-4 backdrop-blur-xl">
      {/* Greeting */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
        >
          Good Morning, {studentName} <span className="inline-block">👋</span>
        </motion.h1>
        <p className="text-sm text-slate-400">
          Here's what's happening at your mess today.
        </p>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search menu, feedback..."
            className="w-56 rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:w-64 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* Notification bell */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Notifications
                  </p>
                </div>
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="cursor-pointer border-b border-slate-50 px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-emerald-50/60"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {n.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile avatar */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 py-1.5 pl-1.5 pr-3 transition-colors duration-200 hover:bg-emerald-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white">
              {studentName.charAt(0)}
            </div>
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
              >
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/student/profile");
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-600 transition-colors duration-150 hover:bg-emerald-50/60"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/student/settings");
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-600 transition-colors duration-150 hover:bg-emerald-50/60"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-500 transition-colors duration-150 hover:bg-red-50"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}