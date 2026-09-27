import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, ScanLine, CheckCircle2, XCircle, Loader2,
  Calendar, Utensils, AlertCircle, Camera, CameraOff
} from "lucide-react";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
function getToken() { return localStorage.getItem("token") || ""; }

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];
function getMealTime() {
  const hour = new Date().getHours();
  if (hour < 10) return "breakfast";
  if (hour < 15) return "lunch";
  return "dinner";
}

export default function QRVerification() {
  const [qrInput, setQrInput] = useState("");
  const [mealType, setMealType] = useState(getMealTime);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ success: 0, rejected: 0 });
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef(null);
  const html5QrcodeRef = useRef(null);

  // Start / stop camera
  useEffect(() => {
    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraOn]);

  const startCamera = async () => {
    setCameraError("");
    try {
      html5QrcodeRef.current = new Html5Qrcode("qr-reader");
      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Auto-submit on scan
          handleVerify(null, decodedText.trim());
          // Pause scanning briefly to avoid duplicate
          html5QrcodeRef.current?.pause();
          setTimeout(() => html5QrcodeRef.current?.resume(), 3000);
        },
        () => {} // ignore per-frame errors
      );
    } catch (err) {
      setCameraError("Camera access denied or not available.");
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
    if (!token) { toast.error("Paste or scan a QR token"); return; }
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
        if (data.alreadyMarked) {
          toast("Already marked for this meal", { icon: "ℹ️" });
        } else {
          toast.success("Attendance verified & marked!");
        }
      } else {
        setResult({ type: "error", message: data.message || "Verification failed" });
        setStats((p) => ({ ...p, rejected: p.rejected + 1 }));
        toast.error("Verification failed");
      }
      setQrInput("");
    } catch (err) {
      toast.error("Server error");
      setResult({ type: "error", message: "Server connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setResult(null); setQrInput(""); };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-600" /> QR Verification
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Scan student QR code or paste token to verify attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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

      <div className="max-w-lg mx-auto space-y-4">
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

        {/* Camera Scanner */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Camera Scanner</label>
            <button
              type="button"
              onClick={() => setCameraOn((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                cameraOn
                  ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {cameraOn ? <><CameraOff className="w-4 h-4" /> Stop</> : <><Camera className="w-4 h-4" /> Start Camera</>}
            </button>
          </div>

          {/* Camera viewport */}
          <div
            id="qr-reader"
            className={`w-full rounded-2xl overflow-hidden bg-slate-900 transition-all ${
              cameraOn ? "h-64" : "h-0"
            }`}
          />

          {cameraError && (
            <p className="mt-2 text-sm text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {cameraError}
            </p>
          )}

          {!cameraOn && (
            <p className="text-xs text-slate-400 text-center py-4">
              Click <strong>Start Camera</strong> to scan student QR codes with your device camera
            </p>
          )}
        </div>

        {/* Manual QR Input form */}
        <form onSubmit={handleVerify} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Manual QR Token</label>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white transition-all px-4 py-3 mb-4">
            <ScanLine className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Paste QR token here..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-60 transition-all hover:scale-[1.01]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {loading ? "Verifying..." : "Verify Attendance"}
          </button>
        </form>

        {/* Result */}
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
                      {result.data.alreadyMarked ? "Already Verified" : "Attendance Verified!"}
                    </span>
                  </div>
                  {result.data.student && (
                    <div className="rounded-2xl bg-white border border-emerald-100 p-4 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                          {result.data.student.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{result.data.student.name}</p>
                          <p className="text-xs text-slate-500">{result.data.student.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-emerald-50">
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
                Clear & Scan Next
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
