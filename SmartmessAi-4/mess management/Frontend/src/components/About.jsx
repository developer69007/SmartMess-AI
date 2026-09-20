import { Target, Brain, Cpu, Leaf } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import yashashvi from "../assets/Yashashvismartmess-AI-modified.png";
import sharthak from "../assets/Sharthaksmartmess-AI-modified.png";
import rishav from "../assets/Rishavsmartmess-AI-modified.png";
import abhinav from "../assets/Abhinavsmartmess-AI-modified.png";

const missionCards = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "Reduce food waste, automate hostel mess operations, improve efficiency, and provide a smarter dining experience.",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence",
    description:
      "Attendance prediction, menu recommendation, waste prediction, demand forecasting, and AI-powered feedback analysis.",
  },
  {
    icon: Cpu,
    title: "Quantum Optimization",
    description:
      "Quantum-inspired optimization helps allocate food resources efficiently, reduce wastage, and improve hostel decision making.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "Reducing food waste, lowering operational costs, and creating environmentally sustainable hostel dining.",
  },
];

const teamMembers = [
  {
    photo: yashashvi,
    name: "Yashashvi Yash",
    role: "Project Lead • Frontend Developer • AI Integration",
    description:
      "Led the architecture of SmartMess AI, developed the frontend, integrated AI features, and coordinated the overall project.",
      github:"https://github.com/developer69007",
       linkedin:"https://www.linkedin.com/in/yashashvi-yash-b05900267?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  },
  {
    photo: sharthak,
    name: "Sharthak Ravi",
    role: "Backend Developer",
    description:
      "Responsible for backend APIs, authentication, server architecture, and database integration.",
      github:"https://github.com/sharthak-coder",
      linkedin:"https://www.linkedin.com/in/sharthak-ravi?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  },
  {
    photo: rishav,
    name: "Rishav Das",
    role: "UI/UX Designer & Testing",
    description:
      "Designed modern interfaces, improved user experience, and tested application functionality.",
      linkedin:"https://www.linkedin.com/in/rishav-rd?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github:"https://github.com/hirishav/hirishav",

  },
  {
    photo: abhinav,
    name: "Abhinav Kumar",
    role: "Database & API Developer",
    description:
      "Designed database structure, optimized APIs, and handled backend connectivity.",
      github:"https://github.com/Abhianv1234",
      linkedin:"https://www.linkedin.com/in/abhinav-kumar-a55836379?utm_source=share_via&utm_content=profile&utm_medium=member_android",

  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden bg-white py-24 px-6"
    >
      {/* Ambient background accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
        {/* ===================== SECTION 1 ===================== */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur-sm">
            About SmartMess AI
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Building the Future of{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Hostel Mess Management
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            SmartMess AI is an intelligent hostel mess management platform
            that combines Artificial Intelligence with Quantum-inspired
            optimization to reduce food waste, improve operational
            efficiency, and enhance the student dining experience.
          </p>
        </div>

        {/* Mission / AI / Quantum / Sustainability cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {missionCards.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative rounded-3xl border border-white/60 bg-white/60 p-7 shadow-lg shadow-emerald-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ===================== SECTION 2 ===================== */}
        <div className="mx-auto mt-28 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Team
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-600">
            The passionate team building SmartMess AI for Hackathon 2026.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map(({ photo, name, role, description, github, linkedin }) => (
            <div
              key={name}
              className="group relative flex flex-col items-center rounded-3xl border border-white/60 bg-white/60 p-7 text-center shadow-lg shadow-emerald-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-[3px] shadow-md shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={photo}
                    alt={name}
                    className="h-full w-full rounded-full border-2 border-white object-cover"
                  />
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  {name}
                </h3>
                <p className="mt-1 text-xs font-medium text-emerald-600">
                  {role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>

                <div className="mt-5 flex items-center justify-center gap-3">
                  <a
               href={github}
             target="_blank"
                 rel="noopener noreferrer"
                aria-label={`${name} GitHub`}
                    >
                    <FaGithub className="h-4 w-4" />
                       </a>

               <a
           href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
           aria-label={`${name} LinkedIn`}
             >
            <FaLinkedin className="h-4 w-4" />
            </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-sm text-slate-500">
          Built with ❤️ by Team SmartMess AI for Hackathon 2026.
        </div>
      </div>
    </section>
  );
}