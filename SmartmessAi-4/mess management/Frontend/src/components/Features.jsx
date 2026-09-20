import { Brain, QrCode, BarChart3, UtensilsCrossed } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Attendance Prediction",
    points: ["Predict daily hostel attendance", "Reduce food waste"],
  },
  {
    icon: QrCode,
    title: "QR Meal Scanner",
    points: ["Fast QR-based meal check-in", "Prevent proxy attendance"],
  },
  {
    icon: BarChart3,
    title: "Smart Analytics Dashboard",
    points: ["Food consumption", "Attendance trends", "Cost analysis"],
  },
  {
    icon: UtensilsCrossed,
    title: "AI Menu Recommendation",
    points: ["Personalized menu suggestions", "Based on student feedback"],
  },
];

export default function Features() {
  return (
    <section
      id="features"
  className="relative w-full overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-teal-50 py-24 px-6">
      {/* Background emerald/teal gradients */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-600 shadow-sm">
            AI Features
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Powerful AI Features
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Everything you need to run a smarter, sustainable, data-driven
            hostel mess — powered by AI.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, points }) => (
            <div
              key={title}
              className="group relative flex flex-col rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-emerald-100/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-200/60"
            >
              {/* Icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-7 w-7 text-white" strokeWidth={2} />
              </div>

              {/* Title */}
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                {title}
              </h3>

              {/* Points */}
              <ul className="space-y-2.5">
                {points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm leading-relaxed text-gray-500"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {point}
                  </li>
                ))}
              </ul>

              {/* Bottom accent line on hover */}
              <div className="absolute inset-x-8 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}