import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain, Zap, QrCode, TrendingDown, Users, ChefHat, BarChart3, CheckCircle2 } from 'lucide-react';

function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

const CHIPS = [
  { icon: QrCode, label: 'QR Scanner Active', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
  { icon: Brain, label: 'ML Forecast', color: 'text-green-700 bg-green-100 border-green-200' },
  { icon: ChefHat, label: 'Smart Kitchen', color: 'text-teal-700 bg-teal-100 border-teal-200' },
  { icon: TrendingDown, label: 'Waste −32%', color: 'text-lime-700 bg-lime-100 border-lime-200' },
];

export default function Hero() {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const students = useCountUp(428, 1800, started);
  const meals = useCountUp(435, 1900, started);
  const waste = useCountUp(32, 1600, started);
  const accuracy = useCountUp(984, 2000, started);

  return (
    <section id="home"
      ref={ref}
      className="relative min-h-screen bg-white flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-200/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-green-200/60 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div className="flex flex-col space-y-7 text-center lg:text-left">

            {/* Status pill */}
            <div className="inline-flex items-center self-center lg:self-start gap-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="text-xs font-semibold text-emerald-700 tracking-wide">AI Engine Running</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
              Mess Management,{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>

            {/* Sub */}
            <p className="text-base text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Powered by Machine Learning, Real-Time QR Attendance, and Predictive Analytics — built for Indian hostels.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-200 group"
              >
                <Sparkles className="w-4 h-4" />
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
              {CHIPS.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${color}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Dashboard */}
          <div className="relative flex justify-center items-center">

            {/* Floating prediction badge */}
            <div className="absolute -top-4 -right-2 z-20 bg-white border border-emerald-200 rounded-2xl px-4 py-3 shadow-xl shadow-emerald-100 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">AI Prediction</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">428 students today</p>
              <p className="text-xs text-slate-400">Confidence: <span className="text-emerald-600 font-semibold">98.4%</span></p>
            </div>

            {/* Glass card */}
            <div className="w-full bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-3xl p-6 shadow-2xl shadow-emerald-100 relative">

              {/* Card header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Live · Today</p>
                  <h3 className="text-base font-bold text-slate-800">Today's Prediction</h3>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold text-emerald-700">Live</span>
                </div>
              </div>

              {/* Metric rows */}
              <div className="space-y-3">
                {[
                  { icon: Users, label: 'Expected Students', value: students, suffix: '', color: 'text-emerald-600 bg-emerald-50', accent: 'text-emerald-700' },
                  { icon: ChefHat, label: 'Meals to Prepare', value: meals, suffix: '', color: 'text-teal-600 bg-teal-50', accent: 'text-teal-700' },
                  { icon: TrendingDown, label: 'Waste Reduction', value: waste, suffix: '%', color: 'text-green-600 bg-green-50', accent: 'text-green-700' },
                  { icon: BarChart3, label: 'AI Confidence', value: Math.floor(accuracy / 10), suffix: '.4%', color: 'text-lime-600 bg-lime-50', accent: 'text-lime-700' },
                ].map(({ icon: Icon, label, value, suffix, color, accent }) => (
                  <div key={label} className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 rounded-xl px-4 py-3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-slate-500 font-medium">{label}</span>
                    </div>
                    <span className={`text-lg font-bold tabular-nums ${accent}`}>
                      {value}{suffix}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-400 font-medium">Model last trained 2 hours ago · accuracy verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}