import React from 'react';
import { PackageOpen, Sparkles, PlusCircle, ArrowRight } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Your junk drawer is currently empty. Add salvaged parts or run Teardown Mode to start generating projects.',
  primaryAction,
  secondaryAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 my-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
          >
            {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
            <span>{primaryAction.label}</span>
          </button>
        )}

        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
            <span>{secondaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
