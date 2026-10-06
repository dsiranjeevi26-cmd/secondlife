import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, ArrowRightLeft, HelpCircle } from 'lucide-react';
import SafetyBadge from './SafetyBadge.jsx';

export default function RequirementChecklist({ requirements = [], catalogMap = {} }) {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {requirements.map((req) => {
        const itemInfo = catalogMap[req.componentId] || {};
        const isCritical = req.critical;
        const status = req.status; // 'have' | 'partial' | 'substitute' | 'missing'

        return (
          <div
            key={req.componentId}
            className={`p-3.5 rounded-xl border transition-all ${
              status === 'have'
                ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/60'
                : status === 'substitute'
                ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60'
                : status === 'partial'
                ? 'bg-orange-50/70 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/60'
                : 'bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-0.5 shrink-0">
                  {status === 'have' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {status === 'substitute' && (
                    <ArrowRightLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  )}
                  {status === 'partial' && (
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  )}
                  {status === 'missing' && (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {req.componentName || itemInfo.name || req.componentId}
                    </span>

                    {isCritical ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 rounded">
                        Critical
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded">
                        Optional
                      </span>
                    )}

                    {itemInfo.safety && itemInfo.safety !== 'none' && (
                      <SafetyBadge safety={itemInfo.safety} className="scale-90 origin-left" />
                    )}
                  </div>

                  {/* Quantity & Stock details */}
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      Required: <strong className="text-slate-800 dark:text-slate-200">{req.needQty}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      In Inventory: <strong className="text-slate-800 dark:text-slate-200">{req.haveExact}</strong>
                    </span>

                    {req.qtyMissing > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          Missing {req.qtyMissing} (Est. ₹{req.qtyMissing * (itemInfo.avgPriceINR || 50)})
                        </span>
                      </>
                    )}

                    {req.usedUntested && (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/40 px-1.5 py-0.5 rounded text-[11px]">
                        ⚠️ includes untested part
                      </span>
                    )}
                  </div>

                  {/* Substitute Explanation Banner */}
                  {status === 'substitute' && req.substituteUsed && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-100/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 text-xs border border-amber-200 dark:border-amber-800/60 flex items-start gap-2">
                      <ArrowRightLeft className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-semibold">Substitution Match:</span> {req.substituteUsed.note}
                        <div className="text-[11px] opacity-80 mt-0.5">
                          (Credited at {Math.round((req.substituteUsed.factor || 0.7) * 100)}% feasibility factor)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Pill Badge */}
              <div className="shrink-0 text-right">
                <span
                  className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                    status === 'have'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : status === 'substitute'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                      : status === 'partial'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                  }`}
                >
                  {status === 'have'
                    ? 'Ready'
                    : status === 'substitute'
                    ? 'Substitute'
                    : status === 'partial'
                    ? 'Partial'
                    : 'Missing'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
