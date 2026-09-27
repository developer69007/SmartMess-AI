import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Loader2, CheckCircle2, Smartphone, Camera, CameraOff,
  ScanLine, AlertCircle, Sparkles, Utensils
} from "lucide-react";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
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
  const [activeMode, setActiveMode] = useState("camera"); // "camera" | "my-qr"
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const html5QrcodeRef = useRef(null);

  // Detect current meal based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) setMealType("breakfast");
    else if (hour >= 11 && hour < 16) setMealType("lunch");
    else setMealType("dinner");
  }, []);

  // Camera start / stop lifecycle
  useEffect(() => {
    if (activeMode === "camera" && cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [cameraOn, activeMode]);

  const startCamera = async () => {
    setCameraError("");
    try {
      html5QrcodeRef.current = new Html5Qrcode("student-qr-reader");
      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Trigger attendance mark on successful scan
          handleMarkAttendance(decodedText.trim());
          // Pause camera momentarily
          html5QrcodeRef.current?.pause();
          setTimeout(() => html5QrcodeRef.current?.resume(), 3500);
        },
        () => {} // Frame error callback
      );
    } catch (err) {
      console.error("Student camera error:", err);
      setCameraError("Camera access denied or unavailable. Please grant camera permission.");
      setCameraOn(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      }
    } catch (_) {}
  };

  const handleMarkAttendance = async (scannedToken) => {
    try {
      setMarking(true);
      const studentId = user?.id || user?._id || "";
      const qrToken = scannedToken || btoa(`${studentId}_${mealType}_${Date.now()}`);
      
      const data = await attendanceService.markAttendance(mealType, qrToken);
      if (data.success) {
        toast.success(`🎉 ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} attendance marked! Thank you email sent.`);
        setLastMarked({
          mealType,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        });
        if (cameraOn) {
          setCameraOn(false);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to mark attendance";
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  };

  const studentId = user?.id || user?._id || "STUDENT";
  const capitalMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-600" /> Student Attendance Scanner
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Open your camera to scan the mess counter QR or show your digital pass
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveMode("camera")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeMode === "camera"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
              : "text-slate-600 hover:text-emerald-700"
          }`}
        >
          <Camera className="w-4 h-4" /> Scan Mess QR (Camera)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMode("my-qr");
            setCameraOn(false);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeMode === "my-qr"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
              : "text-slate-600 hover:text-emerald-700"
          }`}
        >
          <QrCode className="w-4 h-4" /> My Digital Pass QR
        </button>
      </div>

      {/* Meal selector */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Select Meal
        </label>
        <div className="grid grid-cols-3 gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMealType(m.value)}
              className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                mealType === m.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-slate-200 text-slate-500 hover:border-emerald-200"
              }`}
            >
              <span className="block">{m.label}</span>
              <span className="block text-[10px] font-normal opacity-70 mt-0.5">{m.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Live Camera Scanner */}
      {activeMode === "camera" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-lg shadow-emerald-50 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student Live Camera
            </span>
            <button
              type="button"
              onClick={() => setCameraOn((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                cameraOn
                  ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {cameraOn ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" /> Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" /> Start Camera
                </>
              )}
            </button>
          </div>

          {/* Camera Viewport */}
          <div
            id="student-qr-reader"
            className={`w-full rounded-2xl overflow-hidden bg-slate-900 transition-all ${
              cameraOn ? "h-64" : "h-0"
            }`}
          />

          {cameraError && (
            <p className="text-xs text-rose-500 flex items-center justify-center gap-1.5 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {cameraError}
            </p>
          )}

          {!cameraOn && (
            <div className="py-6 border-2 border-dashed border-emerald-100 rounded-2xl bg-emerald-50/40">
              <Camera className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-800">Camera is ready</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Click <strong>Start Camera</strong> to point your phone camera at the mess counter / staff QR code
              </p>
            </div>
          )}

          {/* Quick Mark Button */}
          <button
            type="button"
            onClick={() => handleMarkAttendance()}
            disabled={marking}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
          >
            {marking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Marking Attendance...
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" /> Quick Mark {capitalMeal} Attendance
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Mode 2: Student QR Pass for Staff to Scan */}
      {activeMode === "my-qr" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
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
              Verified Student Pass
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleMarkAttendance()}
            disabled={marking}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            {marking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Recording...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Confirm {capitalMeal} Attendance
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Success Banner */}
      {lastMarked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-center gap-2.5 text-sm text-emerald-700 font-medium"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Thank you! <strong>{lastMarked.mealType.toUpperCase()}</strong> attendance marked at {lastMarked.time}. Confirmation email sent! 🍽️
          </span>
        </motion.div>
      )}

      {/* How it Works Help Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 leading-relaxed space-y-1.5">
        <p className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Attendance Instructions
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li><strong>Option A (Camera):</strong> Open your camera and scan the mess counter QR code.</li>
          <li><strong>Option B (Digital Pass):</strong> Show your QR pass to the mess staff to scan.</li>
          <li><strong>Option C (Quick Mark):</strong> Click the "Quick Mark" button for instant check-in.</li>
          <li>A confirmation email with today's menu will be sent instantly.</li>
        </ul>
      </div>
    </div>
  );
}