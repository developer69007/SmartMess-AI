import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Features from "../../components/Features";
import ProblemSolution from "../../components/ProblemSolution";
import DashboardPreview from "../../components/DashboardPreview";
import Analysis from "../../components/Analysis";
import Stats from "../../components/Stats";
import About from "../../components/About";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 overflow-x-hidden">
      <Navbar />

      <section id="home">
        <Hero />
      </section>

      <section id="features">
        <Features />
      </section>

      <section id="problems">
        <ProblemSolution />
      </section>

      <section id="dashboard">
        <DashboardPreview />
      </section>

      <section id="analysis">
        <Analysis />
      </section>

      <section id="stats">
        <Stats />
      </section>
      <section id = "about"><About/>
      </section>
    </main>
  );
}