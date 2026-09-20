import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await login("admin", email, password);
      if (res.success) {
        toast.success("Welcome back, Admin!");
        navigate("/admin/dashboard");
      } else {
        toast.error(res.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center px-4 py-10">
      {/* Background blurred gradient circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-teal-300/40 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[26rem] w-[26rem] rounded-full bg-emerald-400/20 blur-3xl animate-pulse [animation-duration:6s]" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-2xl shadow-[0_8px_40px_-8px_rgba(15,118,110,0.25)] p-8 sm:p-10 transition-all duration-500">
          {/* Top section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-2 mb-4 animate-[float_6s_ease-in-out_infinite]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                SmartMess AI
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 mb-5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 tracking-wide">
                Admin Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Administrator Login
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Secure access to the SmartMess AI administration dashboard.
            </p>

            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 tracking-wide">
                Secure Administrator Access
              </span>
            </div>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
          `}</style>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartmess.ai"
                  autoComplete="email"
                  className={`w-full rounded-xl border bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] focus:bg-white focus:ring-2 focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    errors.email
                      ? "border-red-300 focus:ring-red-200"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-200"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full rounded-xl border bg-white/70 py-3 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] focus:bg-white focus:ring-2 focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-200"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 rounded-md"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me / Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400 accent-emerald-600"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-emerald-600 transition-colors duration-200 hover:text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 rounded-md"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <ShieldCheck className="h-4.5 w-4.5" />}
                <span className="relative">
                  {loading ? "Signing in..." : "Sign in as Administrator"}
                </span>
              </button>

              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
                Back to Role Selection
              </Link>
            </div>
          </form>

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Need assistance?{" "}
              <span className="font-medium text-slate-600">
                Contact your Hostel System Administrator.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            SmartMess AI v1.0 &middot; Hackathon Edition
          </p>
        </div>
      </div>
    </div>
  );
}