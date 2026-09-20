import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

function useCountUp(target, isInView, duration = 1.2, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    let frameId;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
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

export default function StatCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  icon: Icon,
  accent = "emerald",
  delay = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const animatedValue = useCountUp(value, isInView, 1.2, decimals);

  const accentStyles = {
    emerald: "from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50",
    teal: "from-teal-500 to-teal-600 text-teal-600 bg-teal-50",
    green: "from-green-500 to-green-600 text-green-600 bg-green-50",
  };

  const gradientClass = accentStyles[accent] || accentStyles.emerald;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      {/* Ambient gradient glow on hover */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${gradientClass.split(" ").slice(0, 2).join(" ")} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {animatedValue}
            <span className="text-lg text-slate-400">{suffix}</span>
          </p>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${gradientClass.split(" ").slice(2).join(" ")} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  );
}