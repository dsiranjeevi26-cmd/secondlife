import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Wrench,
  Hammer,
  Scale,
  ShoppingBag,
  ArrowRightLeft,
  Layers,
  Leaf,
  ShieldCheck,
  Check,
  Code,
  Download,
  Copy,
  Cpu,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import { calculateScore } from '../engine/matchEngine.js';
import { calculateProjectPotentialWeight } from '../engine/impact.js';
import { getProjectHardwareData } from '../data/projectCodeData.js';
import ScoreRing from '../components/ScoreRing.jsx';
import RequirementChecklist from '../components/RequirementChecklist.jsx';
import SafetyBadge from '../components/SafetyBadge.jsx';
import InteractiveWorkbench from '../components/InteractiveWorkbench.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    inventory,
    catalog,
    catalogMap,
    substitutes,
    markProjectAsBuilt,
    builtProjects,
    addToast,
  } = useInventory();

  const [builtSuccess, setBuiltSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'steps' | 'pinout' | 'code'
  const [copiedCode, setCopiedCode] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Project Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          The requested repurposing project ID does not exist.
        </p>
        <Link
          to="/suggestions"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Suggestions</span>
        </Link>
      </div>
    );
  }

  // Calculate live score, requirements, and hardware sketches
  const match = calculateScore(project, inventory, catalogMap, substitutes);
  const potentialWeightKg = calculateProjectPotentialWeight(project, catalog);
  const hardwareData = getProjectHardwareData(project);

  const handleBuild = () => {
    const success = markProjectAsBuilt(project.id);
    if (success) {
      setBuiltSuccess(true);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b'],
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(hardwareData.code).then(() => {
      setCopiedCode(true);
      addToast('Arduino source code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 3000);
    });
  };

  const handleDownloadIno = () => {
    const blob = new Blob([hardwareData.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.id}.ino`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${project.id}.ino sketch file!`, 'success');
  };

  const handleExportBOM = () => {
    let bomContent = `SECONDLIFE BILL OF MATERIALS (BOM)\n`;
    bomContent += `Project: ${project.title}\n`;
    bomContent += `Difficulty: ${project.difficulty} | Build Time: ${project.timeHours} Hours\n`;
    bomContent += `Estimated Diverted E-Waste: ${potentialWeightKg} kg\n\n`;
    bomContent += `REQUIREMENTS BREAKDOWN:\n`;
    project.requirements.forEach((req, idx) => {
      const cat = catalogMap[req.componentId] || {};
      bomContent += `${idx + 1}. ${cat.name || req.componentId} - Qty: ${req.qty} [${req.critical ? 'CRITICAL' : 'OPTIONAL'}] - Est. ₹${(cat.avgPriceINR || 50) * req.qty}\n`;
    });
    bomContent += `\nMISSING TO SOURCING:\n`;
    if (match.missingParts.length === 0) {
      bomContent += `All parts in stock in your inventory!\n`;
    } else {
      match.missingParts.forEach((m) => {
        bomContent += `- Missing ${m.qtyMissing}x ${m.componentName} (~₹${m.totalCostINR})\n`;
      });
      bomContent += `Total Est. Sourcing Cost: ₹${match.missingCostINR}\n`;
    }

    const blob = new Blob([bomContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.id}-BOM.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Downloaded project Bill of Materials (BOM)!', 'success');
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/suggestions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Suggestions</span>
        </Link>

        <button
          type="button"
          onClick={handleExportBOM}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export BOM (.txt)</span>
        </button>
      </div>

      {/* Main Project Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {project.difficulty} Level
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Clock className="w-4 h-4" />
                Est. {project.timeHours} Hours Build
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                <Scale className="w-3.5 h-3.5" />
                Diverts ~{potentialWeightKg} kg E-Waste
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {project.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Feasibility Score Gauge */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 text-center">
            <ScoreRing score={match.score} size={84} strokeWidth={8} />
            <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              Feasibility Score
            </div>
            <div className="text-[11px] text-slate-400">
              {match.canBuildNow ? 'Ready to assemble!' : `${match.totalMissingCount} parts missing`}
            </div>
          </div>
        </div>

        {/* Build Action & Warning Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            {match.canBuildNow ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>You have 100% of required components in working stock!</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Missing {match.totalMissingCount} component(s)
                {match.missingCostINR > 0 && (
                  <span>
                    {' '}• Estimated sourcing cost:{' '}
                    <strong className="text-slate-700 dark:text-slate-200">
                      ₹{match.missingCostINR}
                    </strong>
                  </span>
                )}
              </div>
            )}

            {match.hasUntested && (
              <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  Feasibility relies on untested components. Verify continuity in Diagnostic Lab before soldering.
                </span>
              </div>
            )}
          </div>

          {/* "I Built This" Button */}
          <button
            type="button"
            onClick={handleBuild}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/25"
          >
            <Hammer className="w-4 h-4" />
            <span>I built this!</span>
          </button>
        </div>

        {/* Success Alert Banner when marked as built */}
        {builtSuccess && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold block">
                  Congratulations on completing this build!
                </strong>
                <p className="mt-0.5">
                  Components consumed have been deducted from your inventory, and{' '}
                  <strong>{potentialWeightKg} kg</strong> has been added to your diverted e-waste total
                  on the Impact Dashboard.
                </p>
                <div className="mt-2 flex gap-3">
                  <Link to="/impact" className="underline font-bold text-emerald-700 dark:text-emerald-300">
                    View Impact Dashboard →
                  </Link>
                  <Link to="/inventory" className="underline font-medium text-emerald-700 dark:text-emerald-300">
                    Review Inventory →
                  </Link>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBuiltSuccess(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'simulator', label: 'Circuit Simulator & Workbench', icon: Activity },
          { id: 'steps', label: 'Step-by-Step Instructions', icon: Wrench },
          { id: 'pinout', label: 'Hardware Wiring & Pinout', icon: Cpu },
          { id: 'code', label: 'Arduino / C++ Firmware Code', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'simulator' && (
        <InteractiveWorkbench project={project} />
      )}

      {activeTab === 'steps' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-emerald-500" />
            <span>Step-by-Step Assembly Instructions</span>
          </h2>

          <ol className="space-y-4">
            {project.steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {idx + 1}
                </span>
                <div className="text-slate-700 dark:text-slate-300 pt-0.5">
                  {step}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {activeTab === 'pinout' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-500" />
                <span>Hardware Pinout & Breadboard Connections</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact wiring connections between microcontroller headers and salvaged components
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Microcontroller / Header Pin</th>
                  <th className="px-4 py-3">Connected Component / Terminal</th>
                  <th className="px-4 py-3">Signal Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hardwareData.pinout.map((pin, pIdx) => (
                  <tr key={pIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 font-mono">
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {pin.pin}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-sans">
                      {pin.connectsTo}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-sans">
                      {pin.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Firmware Source Code (.ino)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ready to flash directly via Arduino IDE or VS Code PlatformIO
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadIno}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ino</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[420px] select-all">
            {hardwareData.code}
          </pre>
        </div>
      )}

      {/* Grid: Requirements Checklist (Left) & Missing Parts / Safety (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requirements (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" />
                  <span>Component Requirements Checklist</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Evaluated against your active junk drawer inventory
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {match.requirements.length} Items
              </span>
            </div>

            <RequirementChecklist
              requirements={match.requirements}
              catalogMap={catalogMap}
            />
          </div>

          {/* Missing Parts Sourcing List */}
          {match.missingParts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Missing Components to Complete Build ({match.missingParts.length})</span>
                </h3>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Est. ₹{match.missingCostINR}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                You can acquire these parts from electronics supply stores or check our Peer Swap Board
                where fellow makers might be offering them for free or trade!
              </p>

              <div className="space-y-2">
                {match.missingParts.map((part) => (
                  <div
                    key={part.componentId}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{part.componentName}</span>
                        {part.isCritical && (
                          <span className="text-[10px] text-rose-600 font-bold uppercase">
                            (Critical)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Needs {part.qtyMissing} more • ₹{part.avgPriceINR} per unit
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ₹{part.totalCostINR}
                      </span>
                      <Link
                        to="/swap"
                        className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold text-[11px] hover:bg-teal-100"
                        title="Search for this part on peer swap board"
                      >
                        Find on Swap Board
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Safety & Environmental Offset (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Safety Warning Card */}
          {project.safetyNote && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Build Safety Precautions</span>
              </div>
              <p className="text-xs leading-relaxed opacity-95">
                {project.safetyNote}
              </p>
            </div>
          )}

          {/* Environmental Offset Info */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md border border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Leaf className="w-4 h-4" />
              <span>Repurposing Footprint</span>
            </div>
            <div className="text-2xl font-black text-white">
              ~{(potentialWeightKg * 1000).toFixed(0)} Grams Saved
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Completing this build prevents ~{(potentialWeightKg * 5).toFixed(2)} kg of CO₂ equivalent
              emissions from ore extraction, component fabrication, and hazardous waste incineration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
