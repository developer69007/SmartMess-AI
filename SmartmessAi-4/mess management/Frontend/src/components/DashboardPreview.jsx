import {
  Users,
  Trash2,
  IndianRupee,
  Brain,
  UtensilsCrossed,
  Cpu,
  TrendingUp,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-24 px-6">
      {/* Background gradients */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-600 shadow-sm">
            Live AI Dashboard
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            AI Predicts Before Problems Happen
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Real-time mess analytics powered by artificial intelligence.
          </p>
        </div>

        {/* Dashboard container */}
        <div className="relative rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-emerald-100/50 backdrop-blur-xl sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Students Expected */}
            <div className="group flex flex-col rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-md shadow-blue-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-200/50">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-md shadow-blue-300/50">
                  <Users className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-400">Today</span>
              </div>
              <p className="text-sm font-medium text-gray-500">Students Expected</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                842 <span className="text-base font-medium text-gray-400">/ 900</span>
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400"
                  style={{ width: "93.5%" }}
                />
              </div>
            </div>

            {/* Food Waste Prediction */}
            <div className="group flex flex-col rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-md shadow-emerald-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-200/50">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50">
                  <Trash2 className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-400">Predicted</span>
              </div>
              <p className="text-sm font-medium text-gray-500">Food Waste Prediction</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">5%</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: "5%" }}
                />
              </div>
            </div>

            {/* Cost Saved Today */}
            <div className="group flex flex-col rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-md shadow-emerald-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-200/50">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50">
                  <IndianRupee className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                  12%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">Cost Saved Today</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">₹1,480</p>
              <p className="mt-4 text-xs text-gray-400">Compared to yesterday</p>
            </div>

            {/* Prediction Accuracy */}
            <div className="group flex flex-col rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-md shadow-emerald-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-200/50">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50">
                  <Brain className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-400">Model</span>
              </div>
              <p className="text-sm font-medium text-gray-500">Prediction Accuracy</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">98.4%</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: "98.4%" }}
                />
              </div>
            </div>

            {/* Today's Menu Status */}
            <div className="group flex flex-col rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-md shadow-emerald-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-200/50">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50">
                  <UtensilsCrossed className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="mb-3 text-sm font-medium text-gray-500">Today's Menu Status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Breakfast</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lunch</span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                    Preparing
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dinner</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                    Scheduled
                  </span>
                </div>
              </div>
            </div>

            {/* AI Status */}
            <div className="group flex flex-col rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-md shadow-emerald-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-200/50">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50">
                  <Cpu className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">AI Status</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">Online</p>
              <p className="mt-4 text-xs text-gray-400">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}