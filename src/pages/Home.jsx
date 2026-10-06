import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  PackagePlus,
  Wrench,
  Cpu,
  ShieldAlert,
  BarChart3,
  Layers,
  CheckCircle,
  TrendingUp,
  Leaf,
  Recycle,
  Lightbulb,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import StatCard from '../components/StatCard.jsx';
import ScoreRing from '../components/ScoreRing.jsx';

export default function Home() {
  const navigate = useNavigate();
  const {
    inventory,
    rankedProjects,
    impactSummary,
    loadDemoInventory,
  } = useInventory();

  const handleTryDemo = () => {
    loadDemoInventory();
    navigate('/suggestions');
  };

  const topProjects = rankedProjects.slice(0, 3);
  const totalInventoryCount = inventory.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-12 overflow-hidden">
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[350px] bg-gradient-to-tr from-emerald-400/20 via-teal-400/20 to-emerald-600/10 blur-[90px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase mb-6 animate-pulse">
            <Recycle className="w-3.5 h-3.5" />
            <span>Turn E-Waste into Practical Innovation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            Tell us what's in your junk drawer.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              We'll tell you what it can become.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-9 leading-relaxed">
            Stop letting broken electronics gather dust. Input your loose components or salvage scrap laptops,
            smartphones, and routers to discover high-impact DIY electronics projects with feasibility scoring.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/25"
            >
              <PackagePlus className="w-5 h-5" />
              <span>Add my parts</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <button
              type="button"
              onClick={handleTryDemo}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 transition-all shadow-sm"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Try demo inventory</span>
            </button>
          </div>

          {/* Quick status pill */}
          <div className="mt-8 text-xs text-slate-500 dark:text-slate-400">
            {totalInventoryCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" />
                Active inventory: {totalInventoryCount} components stored •{' '}
                <Link to="/suggestions" className="underline font-semibold">
                  View {rankedProjects.length} Project Matches
                </Link>
              </span>
            ) : (
              <span>✨ No parts yet? Click "Try demo inventory" to test live ranking instantly.</span>
            )}
          </div>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <span>Live Repurposing Impact</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated e-waste diverted from landfill by your completed projects
            </p>
          </div>
          <Link
            to="/impact"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Full analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="E-Waste Diverted"
            value={`${impactSummary.totalKgDiverted} kg`}
            subtext="Precious metals & plastics saved"
            color="emerald"
            tooltip="Calculated from actual weight of salvaged components built into verified projects."
          />
          <StatCard
            icon={Layers}
            label="Parts Reused"
            value={impactSummary.totalPartsReused}
            subtext="Microcontrollers, sensors & cells"
            color="teal"
            tooltip="Total discrete components given a second life instead of trash incineration."
          />
          <StatCard
            icon={CheckCircle}
            label="Projects Built"
            value={impactSummary.projectsBuiltCount}
            subtext="Working hardware builds"
            color="blue"
            tooltip="Number of functional devices upcycled through SecondLife."
          />
          <StatCard
            icon={Leaf}
            label="CO₂e Avoided (Est.)"
            value={`${impactSummary.co2AvoidedKg} kg`}
            subtext="Emissions offset index"
            color="amber"
            tooltip="Estimated using standard EPA life-cycle metric of 0.5 kg CO₂e per 0.1 kg electronic hardware."
          />
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How SecondLife Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            From random discarded clutter to functional hardware in three structured steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Log Your Junk or Teardown
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Add individual spare parts from our 50+ component catalog, or pick an obsolete device
              (old laptop, dead router, broken keyboard) to harvest parts with one click.
            </p>
            <Link
              to="/inventory"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 group-hover:underline"
            >
              <span>Explore Inventory & Teardown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Smart Feasibility Matching
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Our deterministic match engine scores 20 predefined reuse projects against your exact parts,
              evaluates component substitutes (e.g., Uno for Nano), and caps incomplete builds.
            </p>
            <Link
              to="/suggestions"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 group-hover:underline"
            >
              <span>View Ranked Suggestions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Build, Swap & Track Impact
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Follow step-by-step schematics, swap missing parts on the peer board, and click "I built this"
              to deduct inventory and log grams of toxic e-waste diverted from dumps.
            </p>
            <Link
              to="/impact"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 group-hover:underline"
            >
              <span>View Environmental Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Top Project Matches
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Projects ranked highest based on your current component inventory
            </p>
          </div>
          <Link
            to="/suggestions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            <span>View all 20 projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProjects.map((match) => (
            <div
              key={match.project.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/50 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {match.project.difficulty} • {match.project.timeHours} hrs
                  </span>
                  <ScoreRing score={match.score} size={48} strokeWidth={4} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
                  <Link to={`/project/${match.project.id}`} className="hover:text-emerald-600">
                    {match.project.title}
                  </Link>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {match.project.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {match.totalMissingCount === 0 ? (
                    <strong className="text-emerald-600">Ready to build!</strong>
                  ) : (
                    <span>Missing {match.totalMissingCount} parts</span>
                  )}
                </span>
                <Link
                  to={`/project/${match.project.id}`}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View Steps →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
