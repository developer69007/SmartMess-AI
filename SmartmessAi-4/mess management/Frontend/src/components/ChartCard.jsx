import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";

const attendanceData = [
  { label: "Mon", value: 78 },
  { label: "Tue", value: 85 },
  { label: "Wed", value: 72 },
  { label: "Thu", value: 90 },
  { label: "Fri", value: 65 },
  { label: "Sat", value: 88 },
  { label: "Sun", value: 94 },
];

const consumptionData = [
  { label: "Mon", value: 340 },
  { label: "Tue", value: 365 },
  { label: "Wed", value: 310 },
  { label: "Thu", value: 402 },
  { label: "Fri", value: 288 },
  { label: "Sat", value: 375 },
  { label: "Sun", value: 410 },
];

const tabs = [
  { id: "attendance", label: "Weekly Attendance", data: attendanceData, unit: "%", icon: BarChart3 },
  { id: "consumption", label: "Food Consumption", data: consumptionData, unit: " meals", icon: TrendingUp },
];

function BarChart({ data, unit }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="relative flex h-40 w-full items-end justify-center">
            <span className="absolute -top-5 text-[11px] font-medium text-slate-400">
              {d.value}
              {unit}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
              className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400"
            />
          </div>
          <span className="text-xs font-medium text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, unit }) {
  const width = 560;
  const height = 180;
  const padding = 24;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full min-w-[420px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaPath}
          fill="url(#areaFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="#0d9488"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />

        {points.map((p, i) => (
          <motion.circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#059669"
            stroke="white"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.9 + i * 0.05 }}
          />
        ))}
      </svg>

      <div className="mt-1 flex justify-between px-6">
        {data.map((d) => (
          <span key={d.label} className="text-xs font-medium text-slate-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ChartCard({ delay = 0 }) {
  const [activeTab, setActiveTab] = useState("attendance");
  const current = tabs.find((t) => t.id === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Insights</h3>

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="chart-tab-bg"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={13} strokeWidth={2.2} className="relative" />
                <span className="relative hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-6"
        >
          {activeTab === "attendance" ? (
            <BarChart data={current.data} unit={current.unit} />
          ) : (
            <LineChart data={current.data} unit={current.unit} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}