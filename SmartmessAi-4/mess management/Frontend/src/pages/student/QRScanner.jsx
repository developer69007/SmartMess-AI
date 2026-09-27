import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Loader2, CheckCircle2, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import attendanceService from "../../services/attendanceService";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", time: "7:30 AM – 9:00 AM" },
  { value: "lunch", label: "Lunch", time: "12:30 PM – 2:00 PM" },
  { value: "dinner", label: "Dinner", time: "7:30 PM – 9:00 PM" },
];

export default function QRScanner() {
  const { user } = useAuth();
  const [mealType, setMealType] = useState("lunch");
  const [marking, setMarking] = useState(false);
  const [lastMarked, setLastMarked] = useState(null);

  // Detect current meal based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 9) setMealType("breakfast");
    else if (hour >= 12 && hour < 14) setMealType("lunch");
    else setMealType("dinner");
  }, []);

  const handleMarkAttendance = async () => {
    try {
      setMarking(true);
      const studentId = user?.id || user?._id || "";
      const qrToken = btoa(`${studentId}_${mealType}_${Date.now()}`);
      const data = await attendanceService.markAttendance(mealType, qrToken);
      if (data.success) {
        toast.success(`✅ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} attendance marked! Today's menu email sent.`);
        setLastMarked({ mealType, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to mark attendance";
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  };

  const studentId = user?.id || user?._id || "STUDENT";
  const qrDisplayValue = `${studentId}|${mealType}|${new Date().toDateString()}`;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">QR Attendance</h1>
        <p className="mt-1 text-sm text-slate-400">Show your QR or mark attendance directly</p>
      </div>

      {/* QR Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-lg shadow-emerald-100"
      >
        {/* Real Scannable QR Code */}
        <div className="mx-auto mb-4 w-48 h-48 rounded-2xl border-2 border-emerald-400 flex flex-col items-center justify-center bg-white p-2.5 shadow-md relative overflow-hidden">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
              btoa(`${studentId}_${mealType}_${Date.now()}`)
            )}`}
            alt="Real Scannable QR Code"
            className="w-40 h-40 object-contain rounded-lg"
          />
        </div>

        <div className="space-y-1 mb-5">
          <p className="font-bold text-slate-900 text-lg">{user?.name || "Student"}</p>
          <p className="text-xs font-mono text-slate-400">{studentId}</p>
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-700">
            Student
          </span>
        </div>

        {/* Meal selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMealType(m.value)}
              className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                mealType === m.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:border-emerald-200"
              }`}
            >
              <span className="block">{m.label}</span>
              <span className="block text-[10px] opacity-70 mt-0.5">{m.time}</span>
            </button>
          ))}
        </div>

        {/* Mark button */}
        <button
          onClick={handleMarkAttendance}
          disabled={marking}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-200 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
        >
          {marking ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Marking...</>
          ) : (
            <><Smartphone className="w-4 h-4" /> Mark {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Attendance</>
          )}
        </button>

        {lastMarked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium capitalize">{lastMarked.mealType}</span> marked at {lastMarked.time}
          </motion.div>
        )}
      </motion.div>

      {/* Info */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <QrCode className="w-4 h-4" /> How it works
        </p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Select the meal type above</li>
          <li>Show your QR code to the staff scanner, OR</li>
          <li>Click "Mark Attendance" to self-mark</li>
          <li>Duplicate marks for the same meal are prevented</li>
        </ul>
      </div>
    </div>
  );
}