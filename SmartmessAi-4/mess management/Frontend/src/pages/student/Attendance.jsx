import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Loader2, CheckCircle2, XCircle, Coffee, Sun, Moon } from "lucide-react";
import attendanceService from "../../services/attendanceService";

const mealConfig = {
  breakfast: { icon: Coffee, label: "Breakfast", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  lunch: { icon: Sun, label: "Lunch", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  dinner: { icon: Moon, label: "Dinner", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
};

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getMyAttendance();
        if (data.success) {
          setRecords(data.records || []);
          setStats({
            total: data.count || 0,
            present: data.totalPresent || 0,
            percentage: data.attendancePercentage || 0,
          });
        }
      } catch (err) {
        console.error("Attendance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Group records by date
  const grouped = records.reduce((acc, record) => {
    const date = new Date(record.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
          <p className="mt-1 text-sm text-slate-400">Track your mess attendance history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Records", value: stats.total, suffix: "", color: "text-slate-700" },
            { label: "Present", value: stats.present, suffix: "", color: "text-emerald-600" },
            { label: "Attendance %", value: stats.percentage, suffix: "%", color: "text-teal-600" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <p className={`text-2xl font-bold ${s.color}`}>
                {s.value}{s.suffix}
              </p>
              <p className="mt-1 text-xs text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Records */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">No attendance records yet</p>
            <p className="text-slate-400 text-sm mt-1">Scan your QR code at the mess to mark attendance.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, dayRecords], i) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {dayRecords.map((record) => {
                      const cfg = mealConfig[record.mealType] || mealConfig.lunch;
                      const Icon = cfg.icon;
                      return (
                        <div key={record._id} className="flex items-center gap-4 px-5 py-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.bg} ${cfg.color}`}>
                            <Icon size={16} strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{cfg.label}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(record.createdAt || record.date).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {record.status === "present" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}