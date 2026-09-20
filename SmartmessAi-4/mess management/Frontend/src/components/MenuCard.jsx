import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default function MenuCard({
  mealType,
  mealName,
  servingTime,
  available = true,
  image,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      {/* Image / gradient header */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500">
        {image && (
          <img
            src={image}
            alt={mealName}
            className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
          {mealType}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-slate-900">
          {mealName}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
          <Clock size={15} strokeWidth={2} />
          <span>{servingTime}</span>
        </div>

        <div
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            available
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {available ? (
            <CheckCircle2 size={13} strokeWidth={2.2} />
          ) : (
            <XCircle size={13} strokeWidth={2.2} />
          )}
          {available ? "Available" : "Not Available"}
        </div>
      </div>
    </motion.div>
  );
}