import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, Clock, Wrench, Sparkles, Bell, Loader2, CheckCheck } from "lucide-react";
import notificationService from "../services/notificationService";

// Map notification type from backend to icon + color
const getIconConfig = (type) => {
  switch (type) {
    case "warning":
      return { icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" };
    case "alert":
      return { icon: Clock, color: "text-red-600", bg: "bg-red-50" };
    case "success":
      return { icon: Sparkles, color: "text-green-600", bg: "bg-green-50" };
    case "info":
    default:
      return { icon: Megaphone, color: "text-emerald-600", bg: "bg-emerald-50" };
  }
};

export default function NotificationCard({ delay = 0 }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Silently fall back — notifications are non-critical
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
              {unreadCount} new
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-28">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No notifications right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 4).map((n, i) => {
            const { icon: Icon, color, bg } = getIconConfig(n.type);
            return (
              <motion.div
                key={n._id || i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: delay + i * 0.08, ease: "easeOut" }}
                whileHover={{ x: 3 }}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-colors duration-200 cursor-pointer ${
                  n.isRead
                    ? "border-slate-100 hover:bg-slate-50/50"
                    : "border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/60"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}
                >
                  <Icon size={16} strokeWidth={2.1} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.isRead ? "text-slate-600" : "text-slate-800"}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}