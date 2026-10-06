import React, { useState } from 'react';
import { Activity, BookOpen, Wrench, Sparkles } from 'lucide-react';
import DiagnosticLab from '../components/DiagnosticLab.jsx';
import ComponentInspector from '../components/ComponentInspector.jsx';

export default function LabTools() {
  const [activeTab, setActiveTab] = useState('multimeter'); // 'multimeter' | 'inspector'

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>Maker Workbench Utilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Hardware Diagnostic Lab & Salvage Toolbox
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test and verify untested components with our interactive digital multimeter, or decode color
            bands and chip markings from desoldered PCBs.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('multimeter')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'multimeter'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Digital Multimeter & Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'inspector'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Decipherer & Resistors</span>
          </button>
        </div>
      </div>

      {/* Main Tool Content */}
      {activeTab === 'multimeter' ? (
        <DiagnosticLab />
      ) : (
        <ComponentInspector />
      )}
    </div>
  );
}
