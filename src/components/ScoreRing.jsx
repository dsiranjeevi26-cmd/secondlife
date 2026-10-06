import React from 'react';

/**
 * ScoreRing component renders a circular feasibility score indicator.
 * Colors:
 * - Green (>= 80)
 * - Amber (50 - 79)
 * - Red (< 50)
 */
export default function ScoreRing({ score = 0, size = 64, strokeWidth = 6, showLabel = true }) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = 'text-red-500 stroke-red-500';
  let bgTrackClass = 'stroke-red-100 dark:stroke-red-950/40';
  let badgeBg = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300';

  if (normalizedScore >= 80) {
    colorClass = 'text-emerald-500 stroke-emerald-500';
    bgTrackClass = 'stroke-emerald-100 dark:stroke-emerald-950/40';
    badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300';
  } else if (normalizedScore >= 50) {
    colorClass = 'text-amber-500 stroke-amber-500';
    bgTrackClass = 'stroke-amber-100 dark:stroke-amber-950/40';
    badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300';
  }

  return (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={bgTrackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-700 ease-out`}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
            {normalizedScore}%
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">match</span>
        </div>
      )}
    </div>
  );
}
