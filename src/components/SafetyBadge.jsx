import React from 'react';
import { BatteryCharging, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SafetyBadge({ safety = 'none', className = '' }) {
  if (safety === 'battery') {
    return (
      <span
        title="Battery safety: Never puncture, short, or solder cells directly."
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ${className}`}
      >
        <BatteryCharging className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>Battery Hazard</span>
      </span>
    );
  }

  if (safety === 'capacitor') {
    return (
      <span
        title="Capacitor hazard: Discharge residual charge before contact."
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 ${className}`}
      >
        <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        <span>High Capacitance</span>
      </span>
    );
  }

  if (safety === 'mains') {
    return (
      <span
        title="Mains hazard: Operates near or connects with 110-240V AC. Exercise caution."
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        <span>Mains AC Hazard</span>
      </span>
    );
  }

  return (
    <span
      title="Low-voltage safe component (<12V DC)"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>Low-Voltage Safe</span>
    </span>
  );
}
