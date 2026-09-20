import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, TrendingDown, Brain, Clock } from "lucide-react";

const stats = [
  {
    id: 1,
    label: "Students Served Daily",
    value: 500,
    suffix: "+",
    icon: Users,
  },
  {
    id: 2,
    label: "Food Waste Reduced",
    value: 32,
    suffix: "%",
    icon: TrendingDown,
  },
  {
    id: 3,
    label: "AI Prediction Accuracy",
    value: 96.4,
    suffix: "%",
    decimals: 1,
    icon: Brain,
  },
  {
    id: 4,
    label: "Faster Mess Check-in",
    value: 4,
    suffix: "x",
    icon: Clock,
  },
];

function useCountUp(target, isInView, duration = 1.4, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    let frameId;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
}

function StatItem({ stat, index, isInView }) {
  const Icon = stat.icon;
  const animatedValue = useCountUp(stat.value, isInView, 1.4, stat.decimals || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center shadow-sm backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20" />

      <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25">
        <Icon size={22} className="text-white" strokeWidth={2} />
      </div>

      <p className="relative mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {animatedValue}
        <span className="text-emerald-600">{stat.suffix}</span>
      </p>

      <p className="relative mt-1.5 text-sm font-medium text-slate-400">
        {stat.label}
      </p>
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative bg-white px-6 py-20 sm:py-28">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/60 via-white to-white" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            Impact so far
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Numbers that matter
          </h2>
          <p className="mt-3 text-slate-500">
            SmartMess AI is already changing how hostels manage food,
            attendance, and waste — one prediction at a time.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatItem key={stat.id} stat={stat} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}