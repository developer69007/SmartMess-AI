import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Clock,
  ClipboardList,
  MessageSquareX,
  Brain,
  QrCode,
  BarChart3,
  MessageSquareText,
} from "lucide-react";

const problems = [
  { icon: Trash2, text: "Food Waste" },
  { icon: Clock, text: "Long Waiting Queues" },
  { icon: ClipboardList, text: "Manual Attendance" },
  { icon: MessageSquareX, text: "Poor Feedback Collection" },
];

const solutions = [
  { icon: Brain, text: "AI Attendance Prediction" },
  { icon: QrCode, text: "QR Meal Scanner" },
  { icon: BarChart3, text: "Smart Analytics Dashboard" },
  { icon: MessageSquareText, text: "AI Feedback Analysis" },
];

export default function ProblemSolution() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-24 px-6">
      {/* Background gradients */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Why SmartMess AI?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Transforming traditional hostel mess management using Artificial
            Intelligence.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Problem card */}
          <div className="group relative flex flex-col rounded-3xl border border-red-100 bg-white/70 p-8 shadow-lg shadow-red-100/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-200/60 sm:p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 shadow-md shadow-red-300/50">
                <AlertTriangle className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Current Problems
              </h3>
            </div>

            <ul className="space-y-4">
              {problems.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3.5 text-gray-700 transition-colors duration-300 hover:bg-red-50"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-red-500" strokeWidth={2} />
                  <span className="text-sm font-medium sm:text-base">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution card */}
          <div className="group relative flex flex-col rounded-3xl border border-emerald-100 bg-white/70 p-8 shadow-lg shadow-emerald-100/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-200/60 sm:p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-300/50">
                <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">
                SmartMess AI Solution
              </h3>
            </div>

            <ul className="space-y-4">
              {solutions.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5 text-gray-700 transition-colors duration-300 hover:bg-emerald-50"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-emerald-600" strokeWidth={2} />
                  <span className="text-sm font-medium sm:text-base">{text}</span>
                </li>
              ))}
            </ul>

            {/* Bottom accent line on hover */}
            <div className="absolute inset-x-8 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
          </div>
        </div>
      </div>
    </section>
  );
}