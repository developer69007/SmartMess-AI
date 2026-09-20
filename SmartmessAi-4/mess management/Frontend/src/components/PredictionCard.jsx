import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Users, UtensilsCrossed, Leaf } from "lucide-react";

const metrics = [
  {
    id: "expected",
    label: "Expected Students",
    value: "412",
    progress: 82,
    icon: Users,
    color: "from-emerald-500 to-emerald-600",
    track: "bg-emerald-100",
  },
  {
    id: "meals",
    label: "Predicted Meals",
    value: "389",
    progress: 78,
    icon: UtensilsCrossed,
    color: "from-teal-500 to-teal-600",
    track: "bg-teal-100",
  },
  {
    id: "waste",
    label: "Food Waste",
    value: "6.2 kg",
    progress: 18,
    icon: Leaf,
    color: "from-green-500 to-green-600",
    track: "bg-green-100",
  },
];

export default function PredictionCard({ confidence = 94.6, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl sm:p-6"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25">
            <Brain size={17} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              AI Prediction
            </h3>
            <p className="text-xs text-slate-400">Based on today's pattern</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs font-medium text-slate-400">
            Confidence
          </span>
          <span className="text-sm font-bold text-emerald-600">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="relative mt-6 space-y-5">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={m.id}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-slate-400" strokeWidth={2} />
                  <span className="text-sm text-slate-600">{m.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {m.value}
                </span>
              </div>

              <div className={`h-2 w-full overflow-hidden rounded-full ${m.track}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${m.progress}%` } : {}}
                  transition={{
                    duration: 1,
                    delay: delay + 0.15 * i,
                    ease: "easeOut",
                  }}
                  className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI confidence footer bar */}
      <div className="relative mt-6 rounded-xl bg-emerald-50/70 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-emerald-700">
            AI Confidence Score
          </span>
          <span className="font-semibold text-emerald-700">
            {confidence}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${confidence}%` } : {}}
            transition={{ duration: 1.1, delay: delay + 0.4, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          />
        </div>
      </div>
    </motion.div>
  );
}