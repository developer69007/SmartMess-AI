import { useState, useCallback, useId } from "react";
import {
  Brain,
  QrCode,
  BarChart3,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  ChefHat,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";

// Simple, reliable email pattern — good enough for client-side gating
// (Firebase still validates server-side on submit).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Falls back to a generic message for anything unrecognized.
 */
const getFriendlyErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/user-not-found":
      return "No account found with this email. Please check and try again.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return "Something went wrong while logging in. Please try again.";
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, studentLogin } = useAuth();

  // Unique ids so aria-describedby always points to the right element,
  // even if this component is ever rendered more than once on a page.
  const emailErrorId = useId();
  const passwordErrorId = useId();

  // Clear the email field's error the moment the user starts fixing it.
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setErrors((prev) => (prev.email ? { ...prev, email: undefined } : prev));
  }, []);

  // Clear the password field's error the moment the user starts fixing it.
  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    setErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Validates the form fields.
   * Trims whitespace before checking so accidental spaces don't pass or fail incorrectly.
   */
  const validate = useCallback(() => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const newErrors = {};

    if (!trimmedEmail) {
      newErrors.email = "Email or Registration Number is required.";
    } else if (trimmedEmail.includes("@") && !EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (isSubmitting) return;
      if (!validate()) return;

      setIsSubmitting(true);

      try {
        // Direct backend authentication against database credentials
        const res = await login("student", email.trim(), password.trim());
        
        if (res.success) {
          toast.success("Login successful! Redirecting...");
          navigate("/student/dashboard");
        } else {
          toast.error(res.message || "Invalid credentials");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Server connection failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, isSubmitting, validate, navigate, login]
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #16a34a 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-200/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-teal-200/60 blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-50 flex justify-center px-6 pt-5">
        <nav
          className="w-full max-w-5xl rounded-xl border border-emerald-200 backdrop-blur-2xl shadow-lg shadow-emerald-100"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}
        >
          <div className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 shadow-md shadow-emerald-200">
                <Sparkles className="text-white" size={14} />
              </div>
              <h1 className="text-base font-extrabold">
                <span className="text-slate-900">SmartMess</span>
                <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent"> AI</span>
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <span>Need help?</span>
              <a
                href="#"
                className="text-emerald-600 hover:text-emerald-500 transition-colors underline underline-offset-4 decoration-emerald-300"
              >
                Contact Support
              </a>
            </div>
          </div>
        </nav>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 gap-12 items-center justify-center z-10">
        <div className="w-full lg:w-[40%] flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
              <Brain className="w-3.5 h-3.5" /> Next-Gen Mess Management
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.08]">
              Welcome{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                Back
              </span>
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-md">
              Sign in to continue using SmartMess AI and optimize your daily dining experience.
            </p>
          </div>
          <div className="grid gap-4 w-full max-w-md lg:max-w-none">
            {[
              {
                icon: Brain,
                title: "AI Attendance Prediction",
                desc: "Predict today's mess attendance accurately to optimize ingredients.",
                color: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300",
              },
              {
                icon: QrCode,
                title: "QR Attendance",
                desc: "Fast, contactless, and secure hostel entry verification mapping.",
                color: "text-teal-600 bg-teal-50 border-teal-100 hover:border-teal-300",
              },
              {
                icon: BarChart3,
                title: "Waste Analytics",
                desc: "Reduce food waste dynamically using advanced AI analytical modeling.",
                color: "text-green-600 bg-green-50 border-green-100 hover:border-green-300",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className={`flex items-start gap-4 p-5 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${color}`}
              >
                <div className={`p-2.5 rounded-xl ${color.split(" ").slice(0, 2).join(" ")}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-600 transition-colors w-fit"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>

        <div className="w-full lg:w-[60%] flex justify-center items-center">
          <div className="w-full max-w-[520px] bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-100 relative">
            <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-3xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Login to your account</h2>
              <p className="text-sm text-slate-400">Manage your hostel mess with AI.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Email Address or Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="username"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="RA2111003010001 or name@university.edu"
                    aria-label="Email Address or Registration Number"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? emailErrorId : undefined}
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.email
                        ? "border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p id={emailErrorId} role="alert" className="text-xs font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    aria-label="Password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? passwordErrorId : undefined}
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.password
                        ? "border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id={passwordErrorId} role="alert" className="text-xs font-medium text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me + forgot password */}
              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    aria-label="Remember me"
                    className="w-4 h-4 rounded border-slate-300 accent-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all duration-200 group disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Student Login</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-x-0 h-[1px] bg-slate-100" />
              <span className="relative px-4 text-xs font-semibold text-slate-400 bg-white uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/login/staff"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-slate-200 font-medium text-sm text-slate-500 transition-all duration-200 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 hover:-translate-y-0.5"
              >
                <ChefHat className="w-4 h-4 text-emerald-500" />
                <span>Staff</span>
              </Link>
              <Link
                to="/login/admin"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-slate-200 font-medium text-sm text-slate-500 transition-all duration-200 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 hover:-translate-y-0.5"
              >
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>Admin</span>
              </Link>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-emerald-600 hover:text-emerald-500 font-medium underline underline-offset-4 decoration-emerald-200 transition-colors"
                >
                  Contact Hostel Administration
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}