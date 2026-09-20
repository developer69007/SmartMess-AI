import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarCheck,
  QrCode,
  MessageSquareText,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
  { label: "Today's Menu", icon: UtensilsCrossed, to: "/student/menu" },
  { label: "Attendance", icon: CalendarCheck, to: "/student/attendance" },
  { label: "QR Scanner", icon: QrCode, to: "/student/scanner" },
  { label: "Feedback", icon: MessageSquareText, to: "/student/feedback" },
  { label: "Profile", icon: User, to: "/student/profile" },
  { label: "Settings", icon: Settings, to: "/student/settings" },
];

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
  }),
};

function SidebarLink({ item, index }) {
  const { label, icon: Icon, to } = item;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
              : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId="sidebar-active-glow"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon
              size={19}
              strokeWidth={2}
              className={[
                "shrink-0 transition-transform duration-200",
                isActive ? "scale-105" : "group-hover:scale-110",
              ].join(" ")}
            />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    </motion.div>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200/70 bg-white/70 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30">
          <Sparkles size={18} className="text-white" strokeWidth={2.2} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          SmartMess <span className="text-emerald-600">AI</span>
        </span>
      </div>

      {/* Menu */}
      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4">
        {menuItems.map((item, index) => (
          <SidebarLink key={item.to} item={item} index={index} />
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200/70 px-4 py-4">
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} strokeWidth={2} />
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}