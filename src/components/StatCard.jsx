import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'emerald',
  tooltip,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorVariants = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            colorVariants[color] || colorVariants.emerald
          }`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>

        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md transition-colors"
              aria-label="Impact assumptions"
            >
              <Info className="w-4 h-4" />
            </button>

            {showTooltip && (
              <div className="absolute right-0 top-7 z-30 w-56 p-2.5 bg-slate-900 text-slate-100 text-[11px] leading-relaxed rounded-xl shadow-xl border border-slate-700 pointer-events-none">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {value}
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
          {label}
        </div>
        {subtext && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
