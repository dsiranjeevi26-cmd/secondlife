import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Zap,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import { playContinuityBeep } from '../utils/audioSynth.js';

export default function DiagnosticLab() {
  const { inventory, catalogMap, updateInventoryItem, addToast } = useInventory();

  // Mode: 'DCV' | 'RES' | 'CONT' | 'DIODE'
  const [dmmMode, setDmmMode] = useState('DCV');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [probePolarity, setProbePolarity] = useState('normal'); // 'normal' | 'reversed'
  const [isMeasuring, setIsMeasuring] = useState(false);

  // Untested items prioritized
  const inventoryItems = useMemo(() => {
    return [...inventory].sort((a, b) => {
      if (a.condition === 'Untested' && b.condition !== 'Untested') return -1;
      if (b.condition === 'Untested' && a.condition !== 'Untested') return 1;
      return 0;
    });
  }, [inventory]);

  const activeItem = useMemo(() => {
    if (selectedInventoryId) {
      return inventory.find((i) => i.id === selectedInventoryId) || null;
    }
    return inventoryItems[0] || null;
  }, [inventory, selectedInventoryId, inventoryItems]);

  const catItem = activeItem ? catalogMap[activeItem.componentId] || {} : {};

  // Compute realistic simulation measurement based on component type and DMM mode
  const measurement = useMemo(() => {
    if (!activeItem) {
      return { display: '0.00', unit: 'V', verdict: 'No component connected', status: 'idle' };
    }

    const type = catItem.id || activeItem.componentId;
    const isUntested = activeItem.condition === 'Untested';
    const isFaulty = activeItem.condition === 'Faulty';

    // 1. DC Voltage Mode
    if (dmmMode === 'DCV') {
      if (type.includes('18650') || type.includes('battery')) {
        if (isFaulty) return { display: '1.14', unit: 'V', verdict: 'Depleted / Damaged Lithium Cell (<2.5V)', status: 'faulty' };
        return { display: '3.88', unit: 'V', verdict: 'Healthy Li-ion Cell Charge (3.6V - 4.2V)', status: 'working' };
      }
      if (type.includes('solar')) {
        return { display: '5.18', unit: 'V', verdict: 'Active Photovoltaic Open-Circuit Voltage', status: 'working' };
      }
      if (type.includes('adapter') || type.includes('charger')) {
        return { display: '5.08', unit: 'V', verdict: 'Stable Regulated 5V DC Supply Rail', status: 'working' };
      }
      return { display: '0.00', unit: 'V', verdict: 'Passive component (No active potential)', status: 'neutral' };
    }

    // 2. Resistance Mode
    if (dmmMode === 'RES') {
      if (type.includes('resistor')) {
        return { display: '9.98', unit: 'kΩ', verdict: 'Within ±1% tolerance of 10 kΩ nominal', status: 'working' };
      }
      if (type.includes('potentiometer')) {
        return { display: '4.82', unit: 'kΩ', verdict: 'Wiper reading smoothly mid-scale (0-10kΩ)', status: 'working' };
      }
      if (type.includes('motor') || type.includes('fan')) {
        return { display: '14.2', unit: 'Ω', verdict: 'Intact low-impedance copper armature winding', status: 'working' };
      }
      if (type.includes('relay')) {
        return { display: '71.5', unit: 'Ω', verdict: 'Normal 5V coil internal resistance', status: 'working' };
      }
      return { display: 'O.L', unit: 'MΩ', verdict: 'High impedance / Open circuit', status: 'neutral' };
    }

    // 3. Continuity Mode
    if (dmmMode === 'CONT') {
      if (type.includes('wire') || type.includes('cable') || type.includes('switch') || type.includes('button')) {
        return { display: '00.4', unit: 'Ω', verdict: 'CONTINUITY OK! Solid low-resistance trace (<1Ω)', status: 'working', beeps: true };
      }
      if (type.includes('motor')) {
        return { display: '14.2', unit: 'Ω', verdict: 'Continuity through motor coil (<50Ω)', status: 'working', beeps: true };
      }
      return { display: 'O.L', unit: '', verdict: 'Open circuit (No direct continuity path)', status: 'neutral', beeps: false };
    }

    // 4. Diode Test Mode
    if (dmmMode === 'DIODE') {
      if (type.includes('led')) {
        if (probePolarity === 'normal') {
          return { display: '1.92', unit: 'V', verdict: 'Forward drop normal. LED emitting light!', status: 'working', illuminates: true };
        } else {
          return { display: 'O.L', unit: 'V', verdict: 'Reverse bias (Normal blocking state)', status: 'neutral', illuminates: false };
        }
      }
      return { display: '0.64', unit: 'V', verdict: 'Standard silicon PN junction drop', status: 'working' };
    }

    return { display: '0.00', unit: '', verdict: 'Ready', status: 'idle' };
  }, [activeItem, catItem, dmmMode, probePolarity]);

  // Trigger audio beep when entering continuity with low resistance
  const handleTestContinuity = () => {
    setIsMeasuring(true);
    if (measurement.beeps) {
      playContinuityBeep(300);
    }
    setTimeout(() => setIsMeasuring(false), 500);
  };

  const handleMarkAsWorking = () => {
    if (!activeItem) return;
    updateInventoryItem(activeItem.id, { condition: 'Working' });
    addToast(`Verified ${catItem.name || activeItem.componentId} as Working!`, 'success');
  };

  const handleMarkAsFaulty = () => {
    if (!activeItem) return;
    updateInventoryItem(activeItem.id, { condition: 'Faulty' });
    addToast(`Marked ${catItem.name || activeItem.componentId} as Faulty.`, 'info');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Hardware Health & Inspection Lab</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Virtual Digital Multimeter & Component Verifier
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test and diagnose unverified hardware before soldering into projects. Test Li-ion cells,
            check coil resistance, and audit continuity.
          </p>
        </div>

        {activeItem && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              activeItem.condition === 'Working'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300'
                : activeItem.condition === 'Untested'
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300'
            }`}
          >
            Current State: {activeItem.condition}
          </span>
        )}
      </div>

      {inventory.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
          No components in inventory to test. Add items or salvage devices to use the diagnostic station.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Component Selector & DMM Rotary Dial (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Component Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Component Under Test (DUT):
              </label>
              <select
                value={activeItem?.id || ''}
                onChange={(e) => setSelectedInventoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {inventoryItems.map((item) => {
                  const c = catalogMap[item.componentId] || {};
                  return (
                    <option key={item.id} value={item.id}>
                      {item.condition === 'Untested' ? '⚠️ [Untested] ' : ''}
                      {c.name || item.componentId} (Qty: {item.qty}) - {item.condition}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* DMM Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                DMM Rotary Switch Function:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'DCV', label: 'DC Voltage (V⎓)', desc: 'Batteries, regulators, adapters' },
                  { id: 'RES', label: 'Resistance (Ω)', desc: 'Resistors, coils, windings' },
                  { id: 'CONT', label: 'Continuity (🔊)', desc: 'Wires, switches, traces' },
                  { id: 'DIODE', label: 'Diode / LED (▶|)', desc: 'LED forward drop test' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setDmmMode(mode.id);
                      if (mode.id === 'CONT' && measurement.beeps) {
                        playContinuityBeep(250);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      dmmMode === mode.id
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-bold">{mode.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        dmmMode === mode.id ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {mode.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Probe Polarity Toggle (Useful for Diode / LED test) */}
            {dmmMode === 'DIODE' && (
              <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Probe Polarity:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setProbePolarity((p) => (p === 'normal' ? 'reversed' : 'normal'))
                  }
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                >
                  {probePolarity === 'normal'
                    ? 'Normal (Red Anode, Black Cathode)'
                    : 'Reversed (Black Anode, Red Cathode)'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Digital Multimeter Instrument LCD Display (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            {/* Instrument Brand Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800/80 pb-3">
              <span className="font-mono font-bold tracking-widest text-slate-300">
                SECONDLIFE DMM-6000
              </span>
              <span className="font-mono text-emerald-400">
                AUTO-RANGE • TRUE RMS
              </span>
            </div>

            {/* Main Segment Display */}
            <div className="py-6 flex items-baseline justify-end gap-3 px-4">
              <span className="font-mono font-black text-5xl sm:text-6xl text-emerald-400 tracking-tight select-none">
                {measurement.display}
              </span>
              <span className="font-mono font-bold text-2xl sm:text-3xl text-emerald-500">
                {measurement.unit}
              </span>
            </div>

            {/* Verdict and Diagnostic Banner */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Diagnostic Analysis:</span>
                {dmmMode === 'CONT' && (
                  <button
                    type="button"
                    onClick={handleTestContinuity}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ping Probe Beep</span>
                  </button>
                )}
              </div>

              <div
                className={`font-semibold text-xs leading-relaxed flex items-center gap-2 ${
                  measurement.status === 'working'
                    ? 'text-emerald-400'
                    : measurement.status === 'faulty'
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {measurement.status === 'working' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : measurement.status === 'faulty' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
                )}
                <span>{measurement.verdict}</span>
              </div>
            </div>

            {/* Fast Action Buttons to update condition */}
            <div className="pt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleMarkAsFaulty}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-900 hover:bg-rose-900/40 active:scale-95 transition-all"
              >
                Mark as Faulty
              </button>

              <button
                type="button"
                onClick={handleMarkAsWorking}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-md shadow-emerald-950"
              >
                Verify & Mark as Working
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
