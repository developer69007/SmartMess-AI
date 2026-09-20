import { Brain, BarChart3, TrendingUp, MessageSquareText } from "lucide-react";

const analyses = [
  {
    icon: Brain,
    title: "Attendance Prediction",
    description:
      "AI predicts tomorrow's student attendance using historical data.",
  },
  {
    icon: BarChart3,
    title: "Food Consumption Analysis",
    description:
      "Analyzes meal trends to estimate ingredient requirements accurately.",
  },
  {
    icon: TrendingUp,
    title: "Waste Optimization",
    description:
      "Identifies waste patterns and recommends smarter food preparation.",
  },
  {
    icon: MessageSquareText,
    title: "Feedback Intelligence",
    description:
      "Processes student feedback to improve menus and dining satisfaction.",
  },
];

export default function Analysis() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-24 px-6">
      {/* Background gradients */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-600 shadow-sm">
            AI Analysis
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            How SmartMess AI Makes Intelligent Decisions
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Our AI continuously analyzes hostel data to optimize operations
            and reduce food waste.
          </p>
        </div>

        {/* Analysis cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {analyses.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative flex flex-col rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-emerald-100/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-200/60"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-7 w-7 text-white" strokeWidth={2} />
              </div>

              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {description}
              </p>

              {/* Bottom accent line on hover */}
              <div className="absolute inset-x-8 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}