import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="fixed top-3 left-0 right-0 z-50 flex justify-center px-6">
      <nav className="w-full max-w-5xl rounded-xl border border-emerald-200 bg-white/85 backdrop-blur-2xl shadow-lg shadow-emerald-100">
        <div className="h-14 px-6 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600">
              <Sparkles className="text-white" size={14} />
            </div>

            <h1 className="text-base font-extrabold">
              <span className="text-slate-900">SmartMess</span>
              <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                {" "}AI
              </span>
            </h1>
          </div>

          {/* Navigation */}
          <ul className="hidden md:flex items-center gap-7">
            <li>
              <a href="#home" className="text-xs text-slate-500 hover:text-emerald-700">
                Home
              </a>
            </li>

            <li>
              <a href="#features" className="text-xs text-slate-500 hover:text-emerald-700">
                Features
              </a>
            </li>

            <li>
              <a href="#analysis" className="text-xs text-slate-500 hover:text-emerald-700">
                Analysis
              </a>
            </li>

            <li>
              <a href="#about" className="text-xs text-slate-500 hover:text-emerald-700">
                About
              </a>
            </li>
          </ul>

          {/* Login */}
          <Link
            to="/login"
            className="rounded-lg bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:scale-105"
          >
            Login
          </Link>

        </div>
      </nav>
    </header>
  );
}