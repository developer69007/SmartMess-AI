import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, ScanLine, CheckCircle2, XCircle, Loader2,
  Calendar, Utensils, AlertCircle, Camera, CameraOff, Sparkles, Monitor, Mail, UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
function getToken() { return localStorage.getItem("token") || ""; }

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];
function getMealTime() {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  return "dinner";
}

// Optional audio feedback for successful scan
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

export default function QRVerification() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "counter-qr"
  const [qrInput, setQrInput] = useState("");
  const [mealType, setMealType] = useState(getMealTime);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ success: 0, rejected: 0 });
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const html5QrcodeRef = useRef(null);

  // Start / stop camera
  useEffect(() => {
    if (activeTab === "camera" && cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraOn, activeTab]);

  const startCamera = async () => {
    setCameraError("");
    try {
      html5QrcodeRef.current = new Html5Qrcode("staff-qr-reader");
      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleVerify(null, decodedText.trim());
          html5QrcodeRef.current?.pause();
          setTimeout(() => html5QrcodeRef.current?.resume(), 3500);
        },
        () => {}
      );
    } catch (err) {
      setCameraError("Camera access denied or not available. Please allow camera permissions.");
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

  const handleVerify = async (e, scannedToken) => {
    if (e) e.preventDefault();
    const token = scannedToken || qrInput.trim();
    if (!token) { toast.error("Paste or scan a student QR token"); return; }
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch(
        `${API_BASE}/attendance/verify/${encodeURIComponent(token)}?mealType=${mealType}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();

      if (data.success && data.verified) {
        setResult({ type: "success", data });
        setStats((p) => ({ ...p, success: p.success + 1 }));
        playSuccessSound();
        if (data.alreadyMarked) {
          toast(data.message || "Student already marked for this meal today", { icon: "ℹ️" });
        } else {
          toast.success(
            `🎉 Attendance Marked for ${data.student?.name || "Student"} (${mealType.toUpperCase()})! Confirmation email sent.`,
            { duration: 5000 }
          );
        }
      } else {
        setResult({ type: "error", message: data.message || "Verification failed" });
        setStats((p) => ({ ...p, rejected: p.rejected + 1 }));
        toast.error(data.message || "Verification failed");
      }
      setQrInput("");
    } catch (err) {
      toast.error("Server error during verification");
      setResult({ type: "error", message: "Server connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setResult(null); setQrInput(""); };

  const staffId = user?.id || user?._id || "STAFF01";
  const counterQrPayload = btoa(`COUNTER_${staffId}_${mealType}_${new Date().toISOString().split("T")[0]}`);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-600" /> Staff Attendance Scanner & Counter QR
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Scan student passes with your camera or display the mess counter QR for students to scan
        </p>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Verified Today", value: stats.success, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-rose-100 text-rose-700" },
          { label: "Current Meal", value: mealType, icon: Utensils, color: "bg-teal-100 text-teal-700" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl mb-2 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-slate-900 capitalize">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "camera"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
              : "text-slate-600 hover:text-emerald-700"
          }`}
        >
          <Camera className="w-4 h-4" /> Staff Scanner (Camera)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("counter-qr");
            setCameraOn(false);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "counter-qr"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
              : "text-slate-600 hover:text-emerald-700"
          }`}
        >
          <Monitor className="w-4 h-4" /> Mess Counter QR Display
        </button>
      </div>

      {/* Meal selector */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Meal Type</label>
        <div className="flex gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMealType(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                mealType === m
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Staff Live Camera Scanner */}
      {activeTab === "camera" && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Staff Scanner Camera
              </label>
              <button
                type="button"
                onClick={() => setCameraOn((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  cameraOn
                    ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {cameraOn ? <><CameraOff className="w-3.5 h-3.5" /> Stop Camera</> : <><Camera className="w-3.5 h-3.5" /> Start Camera</>}
              </button>
            </div>

            {/* Camera viewport */}
            <div
              id="staff-qr-reader"
              className={`w-full rounded-2xl overflow-hidden bg-slate-900 transition-all ${
                cameraOn ? "h-64" : "h-0"
              }`}
            />

            {cameraError && (
              <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {cameraError}
              </p>
            )}

            {!cameraOn && (
              <p className="text-xs text-slate-400 text-center py-5">
                Click <strong>Start Camera</strong> to point your device camera at a student's digital QR pass
              </p>
            )}
          </div>

          {/* Manual QR Input form */}
          <form onSubmit={handleVerify} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Manual QR Token Entry
            </label>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white transition-all px-4 py-3 mb-4">
              <ScanLine className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Paste or enter student QR token / ID / email..."
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !qrInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-60 transition-all hover:scale-[1.01]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? "Verifying..." : "Verify & Mark Attendance"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Mess Counter QR Code Display */}
      {activeTab === "counter-qr" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg shadow-emerald-100 space-y-4"
        >
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              Live Mess Counter QR
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {mealType.toUpperCase()} Counter Check-in Pass
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Display this screen at the mess counter or tablet. Students can open their camera scanner to check in.
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-emerald-400 rounded-3xl shadow-md inline-block">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(counterQrPayload)}`}
              alt="Mess Counter QR Code"
              className="w-52 h-52 object-contain rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-mono text-slate-500">
              Verified by: {user?.name || "Staff"} · Shift: {mealType}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              ● Live Sync with Student Email Notifications Active
            </p>
          </div>
        </motion.div>
      )}

      {/* Verification Result Notification */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-3xl border p-5 shadow-sm ${
              result.type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
            }`}
          >
            {result.type === "success" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-700">
                    {result.data.alreadyMarked ? "Already Verified Earlier Today" : "Attendance Verified & Marked Successfully!"}
                  </span>
                </div>
                {result.data.student && (
                  <div className="rounded-2xl bg-white border border-emerald-100 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                        {result.data.student.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-base truncate">{result.data.student.name}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-600" /> {result.data.student.email}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 font-semibold shrink-0">
                        Email Sent ✓
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-emerald-50">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="capitalize">{result.data.attendance?.mealType || mealType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{new Date().toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-700">Verification Failed</p>
                  <p className="text-sm text-rose-600 mt-0.5">{result.message}</p>
                </div>
              </div>
            )}
            <button
              onClick={clear}
              className="mt-3 text-xs font-semibold text-slate-500 underline hover:text-slate-700"
            >
              Clear & Scan Next Student
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
