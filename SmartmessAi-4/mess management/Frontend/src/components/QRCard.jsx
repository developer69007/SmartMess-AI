import { motion } from "framer-motion";
import { QrCode, ScanLine } from "lucide-react";

export default function QRCard({ studentId = "SRM24CSE0187", onScan, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center shadow-sm backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-10 blur-3xl" />

      <div className="relative">
        <h3 className="text-sm font-semibold text-slate-900">
          Mess Attendance QR
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Show this at the counter to mark attendance
        </p>
      </div>

      {/* Real QR image */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative mt-5 flex h-44 w-44 items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-2 shadow-inner"
      >
        {/* scan line animation */}
        <motion.div
          initial={{ y: -70 }}
          animate={{ y: 70 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent z-10"
        />
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=6&ecc=M&data=${encodeURIComponent(
            btoa(`${studentId}_lunch`)
          )}`}
          alt="Scannable Student QR Code"
          className="w-36 h-36 rounded-xl bg-white p-1 shadow-sm"
        />
      </motion.div>

      <p className="relative mt-4 text-xs font-medium tracking-wide text-slate-400">
        ID: <span className="text-slate-600">{studentId}</span>
      </p>

      {/* Scan button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onScan}
        className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-shadow duration-200 hover:shadow-lg hover:shadow-emerald-500/35"
      >
        <ScanLine size={17} strokeWidth={2.2} />
        Scan QR
      </motion.button>
    </motion.div>
  );
}