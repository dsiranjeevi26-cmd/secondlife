import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, AlertTriangle, ArrowRight, Sparkles, Wrench } from 'lucide-react';
import ScoreRing from './ScoreRing.jsx';

export default function ProjectCard({ match, onQuickBuild }) {
  const {
    project,
    score,
    missingParts = [],
    missingCostINR = 0,
    hasUntested = false,
    canBuildNow = false,
    criticalMissingCount = 0,
    totalMissingCount = 0,
  } = match;

  const difficultyColors = {
    Beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    Intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    Advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  };

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all overflow-hidden">
      {/* 100% Can Build Now Ribbon */}
      {canBuildNow && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Build!</span>
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header with Title and Score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 pr-2">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  difficultyColors[project.difficulty] || difficultyColors.Beginner
                }`}
              >
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {project.timeHours} hrs
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              <Link to={`/project/${project.id}`}>{project.title}</Link>
            </h3>
          </div>

          <div className="shrink-0">
            <ScoreRing score={score} size={58} strokeWidth={5} />
          </div>
        </div>

        {/* Short description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Status flags / Untested alert */}
        {hasUntested && (
          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Feasibility includes untested parts</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-[11px] text-slate-400 py-0.5">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* Missing parts summary bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
          {totalMissingCount === 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> All components in stock!
            </span>
          ) : (
            <div className="text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {totalMissingCount} {totalMissingCount === 1 ? 'part' : 'parts'} missing
              </span>{' '}
              {criticalMissingCount > 0 && (
                <span className="text-rose-700 dark:text-rose-300">({criticalMissingCount} critical)</span>
              )}
              {missingCostINR > 0 && (
                <span className="text-slate-400"> • ~₹{missingCostINR}</span>
              )}
            </div>
          )}

          <Link
            to={`/project/${project.id}`}
            className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors ml-auto"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
