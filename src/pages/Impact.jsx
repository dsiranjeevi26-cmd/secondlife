import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Leaf,
  Scale,
  Layers,
  CheckCircle,
  Share2,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

const PIE_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
];

export default function Impact() {
  const { impactSummary, builtProjects, addToast, projects } = useInventory();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `🌱 My SecondLife E-Waste Repurposing Record:\n` +
      `• ${impactSummary.totalKgDiverted} kg electronic waste diverted from landfills\n` +
      `• ${impactSummary.totalPartsReused} components salvaged & repurposed\n` +
      `• ${impactSummary.projectsBuiltCount} functional hardware projects built\n` +
      `• ~${impactSummary.co2AvoidedKg} kg CO₂e emissions estimated avoided!\n\n` +
      `Repurpose your junk drawer with SecondLife!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      addToast('Copied impact summary to clipboard!', 'success');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Leaf className="w-7 h-7 text-emerald-500" />
            <span>Environmental Impact & Waste Diversion</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time LCA telemetry tracking electronic hardware kept in circular circulation (All figures estimated)
          </p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
        >
          <Share2 className="w-4 h-4" />
          <span>{copied ? 'Copied to Clipboard!' : 'Share My Impact'}</span>
        </button>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Scale}
          label="E-Waste Diverted"
          value={`${impactSummary.totalKgDiverted} kg`}
          subtext="Net weight of salvaged parts"
          color="emerald"
          tooltip="Estimated based on sum of average catalog weights of parts physically consumed in your completed projects."
        />
        <StatCard
          icon={Layers}
          label="Parts Reused"
          value={`${impactSummary.totalPartsReused} units`}
          subtext="Chips, sensors & cells saved"
          color="teal"
          tooltip="Total discrete components rescued from electronic scrap and integrated into working builds."
        />
        <StatCard
          icon={CheckCircle}
          label="Projects Built"
          value={`${impactSummary.projectsBuiltCount} builds`}
          subtext="Active hardware projects"
          color="blue"
          tooltip="Total functional projects marked as built and verified in your workshop."
        />
        <StatCard
          icon={Leaf}
          label="CO₂e Avoided (Est.)"
          value={`${impactSummary.co2AvoidedKg} kg`}
          subtext="Emissions offset factor"
          color="amber"
          tooltip="Estimated using EPA LCA model: 0.5 kg CO₂e avoided per 0.1 kg e-waste (mining, refining, and manufacturing energy offset)."
        />
      </div>

      {/* Assumptions & Methodology Alert Card */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-100 block mb-0.5">
            LCA Methodology & Environmental Assumptions:
          </span>
          <p className="leading-relaxed">
            All metrics above are <em>conservative estimates</em>. We assume 0.5 kg CO₂e avoided per 100g of e-waste kept
            in use (representing avoided raw copper, silicon wafer fab, lithium extraction, and plastic smelting).
            Actual savings vary by component age, local electricity grid carbon intensity, and thermal end-of-life routes.
          </p>
        </div>
      </div>

      {/* Charts Section */}
      {builtProjects.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No projects built yet"
          description="Build your first repurposing project from our suggestions list to see live bar charts and component category distributions here."
          primaryAction={{
            label: 'Explore Project Suggestions',
            icon: Sparkles,
            onClick: () => (window.location.href = '#/suggestions'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Kg Diverted Per Project (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span>E-Waste Diverted by Project (Estimated kg)</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Bar Chart</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Comparative mass of electronics saved per completed hardware build
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={impactSummary.projectChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 11, fill: '#888888' }}
                    interval={0}
                    tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}...` : val)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#888888' }}
                    unit="kg"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val) => [`${val} kg diverted`, 'Estimated Mass']}
                  />
                  <Bar dataKey="kgDiverted" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Reused Parts by Category (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-teal-500" />
                  <span>Reused Parts by Category</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Distribution</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Proportion of microcontrollers, sensors, passives, and motors repurposed
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={impactSummary.categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {impactSummary.categoryChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val, name, entry) => [
                      `${val} units (${entry.payload.weightKg} kg)`,
                      entry.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Built Projects History Table */}
      {builtProjects.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Completed Upcycle Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified hardware builds created from your salvaged electronics
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {builtProjects.length} Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Project Title</th>
                  <th className="px-4 py-3">Components Consumed</th>
                  <th className="px-4 py-3 text-right">Diverted Mass (Est.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {builtProjects.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      <Link to={`/project/${record.projectId}`} className="hover:text-emerald-600">
                        {record.projectTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {record.partsCount || record.usedParts?.length || 1} components
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {record.kgDiverted} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
