import React, { useState, useMemo } from 'react';
import { Search, Calculator, Cpu, Sparkles, Plus, BookOpen, Layers } from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';

const COLOR_CODES = [
  { name: 'Black', hex: '#111827', digit: 0, mult: 1 },
  { name: 'Brown', hex: '#78350f', digit: 1, mult: 10, tol: '±1%' },
  { name: 'Red', hex: '#dc2626', digit: 2, mult: 100, tol: '±2%' },
  { name: 'Orange', hex: '#ea580c', digit: 3, mult: 1000 },
  { name: 'Yellow', hex: '#eab308', digit: 4, mult: 10000 },
  { name: 'Green', hex: '#16a34a', digit: 5, mult: 100000, tol: '±0.5%' },
  { name: 'Blue', hex: '#2563eb', digit: 6, mult: 1000000, tol: '±0.25%' },
  { name: 'Violet', hex: '#7c3aed', digit: 7, mult: 10000000, tol: '±0.1%' },
  { name: 'Gray', hex: '#64748b', digit: 8, mult: 100000000 },
  { name: 'White', hex: '#f8fafc', digit: 9, mult: 1000000000 },
  { name: 'Gold', hex: '#d97706', digit: null, mult: 0.1, tol: '±5%' },
  { name: 'Silver', hex: '#94a3b8', digit: null, mult: 0.01, tol: '±10%' },
];

const COMMON_ICS = [
  {
    code: 'AMS1117-3.3',
    name: '3.3V 1A LDO Voltage Regulator',
    package: 'SOT-223 / TO-252',
    source: 'Wi-Fi routers, Arduino boards, TV mainboards',
    ratings: 'Vin: 4.75V - 12V, Vout: 3.3V @ 1000mA max',
    repurpose: 'Perfect for stepping down 5V phone charger rails to power sensitive 3.3V ESP8266/ESP32 & sensors.',
    componentId: 'buck-converter',
  },
  {
    code: 'NE555',
    name: 'Precision Monostable / Astable Timer IC',
    package: 'DIP-8 / SOIC-8',
    source: 'Old alarm clocks, inverter boards, CRT monitors',
    ratings: 'Vcc: 4.5V - 16V, Output: 200mA sink/source',
    repurpose: 'Use for LED flashers, PWM motor speed controllers, and piezo buzzer audio generators without requiring a microcontroller.',
    componentId: 'push-buttons',
  },
  {
    code: 'TP4056',
    name: '1A Constant-Current/Constant-Voltage Li-ion Charger',
    package: 'SOP-8-PP',
    source: 'Vapes, portable USB battery banks, Bluetooth headphones',
    ratings: 'Vin: 4.5V - 5.5V, Vbat: 4.2V ±1%, Charge: 1000mA (adjustable)',
    repurpose: 'Essential IC for safe USB recharging of salvaged 18650 laptop battery cells.',
    componentId: 'tp4056',
  },
  {
    code: 'L298N',
    name: 'Dual Full-Bridge High-Voltage Motor Driver',
    package: 'MultiWatt-15',
    source: 'Printers, scanners, optical disc drives',
    ratings: 'Vs: Up to 46V, Io: 2A peak per bridge',
    repurpose: 'Ideal for driving 2WD/4WD robot chassis DC motors or 4-wire bipolar stepper motors.',
    componentId: 'l298n-driver',
  },
  {
    code: 'ATmega328P',
    name: '8-Bit Microcontroller with 32KB Flash',
    package: 'DIP-28 / TQFP-32',
    source: 'Dead Arduino Uno/Nano clones, industrial timers',
    ratings: 'Vcc: 1.8V - 5.5V, Clock: 16MHz, Flash: 32KB',
    repurpose: 'Core brain for standalone custom circuits; flash with Arduino bootloader using simple ISP wires.',
    componentId: 'arduino-uno',
  },
  {
    code: 'LM358',
    name: 'Dual Low-Power Operational Amplifier',
    package: 'DIP-8 / SOIC-8',
    source: 'Audio amplifiers, battery chargers, sensor modules',
    ratings: 'Vcc: 3V - 32V, Unity gain bandwidth: 1MHz',
    repurpose: 'Use as voltage comparator for LDR night lamps, soil probe amplifiers, or analog microphone pre-amps.',
    componentId: 'sound-sensor',
  },
];

export default function ComponentInspector() {
  const { addInventoryItem } = useInventory();
  const [activeTab, setActiveTab] = useState('resistor'); // 'resistor' | 'ic' | 'capacitor'

  // Resistor Color Code state
  const [band1, setBand1] = useState(1); // Brown (1)
  const [band2, setBand2] = useState(0); // Black (0)
  const [multIndex, setMultIndex] = useState(3); // Orange (1000) -> 10k
  const [tolIndex, setTolIndex] = useState(10); // Gold (5%)

  // Calculated resistance
  const resistanceValue = useMemo(() => {
    const b1 = COLOR_CODES[band1].digit;
    const b2 = COLOR_CODES[band2].digit;
    const mult = COLOR_CODES[multIndex].mult;
    return (b1 * 10 + b2) * mult;
  }, [band1, band2, multIndex]);

  const formattedResistance = useMemo(() => {
    if (resistanceValue >= 1000000) {
      return `${(resistanceValue / 1000000).toFixed(1)} MΩ`;
    }
    if (resistanceValue >= 1000) {
      return `${(resistanceValue / 1000).toFixed(1)} kΩ`;
    }
    return `${resistanceValue} Ω`;
  }, [resistanceValue]);

  // IC Search state
  const [icSearch, setIcSearch] = useState('');

  const filteredIcs = useMemo(() => {
    if (!icSearch.trim()) return COMMON_ICS;
    const term = icSearch.toLowerCase();
    return COMMON_ICS.filter(
      (ic) =>
        ic.code.toLowerCase().includes(term) ||
        ic.name.toLowerCase().includes(term) ||
        ic.source.toLowerCase().includes(term)
    );
  }, [icSearch]);

  // Capacitor 3-Digit EIA Calculator
  const [capCode, setCapCode] = useState('104');

  const capValue = useMemo(() => {
    if (!/^\d{3}$/.test(capCode)) return null;
    const d1 = parseInt(capCode[0], 10);
    const d2 = parseInt(capCode[1], 10);
    const d3 = parseInt(capCode[2], 10);
    const pF = (d1 * 10 + d2) * Math.pow(10, d3);
    const nF = pF / 1000;
    const uF = pF / 1000000;
    return { pF, nF, uF };
  }, [capCode]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Salvager's Knowledge Toolbox</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Component Decipherer & Color Code Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Decode color stripes on desoldered resistors, look up obscure scrap chip markings, and
            convert 3-digit capacitor EIA codes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('resistor')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'resistor'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Resistor Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ic')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'ic'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            SMD & IC Lookup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('capacitor')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'capacitor'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Capacitor Codes
          </button>
        </div>
      </div>

      {/* Tab 1: Resistor Color Code Calculator */}
      {activeTab === 'resistor' && (
        <div className="space-y-6">
          {/* Visual Resistor Graphic */}
          <div className="p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
            <div className="relative w-72 h-16 flex items-center justify-center">
              {/* Wire leads */}
              <div className="absolute w-full h-1 bg-slate-400 rounded-full" />
              {/* Resistor Body */}
              <div className="relative w-44 h-12 bg-amber-100 border-2 border-amber-300 rounded-xl flex items-center justify-around px-4 shadow-md z-10">
                {/* Band 1 */}
                <div
                  className="w-3 h-full rounded-sm shadow-inner"
                  style={{ backgroundColor: COLOR_CODES[band1].hex }}
                  title={`Band 1: ${COLOR_CODES[band1].name}`}
                />
                {/* Band 2 */}
                <div
                  className="w-3 h-full rounded-sm shadow-inner"
                  style={{ backgroundColor: COLOR_CODES[band2].hex }}
                  title={`Band 2: ${COLOR_CODES[band2].name}`}
                />
                {/* Multiplier Band */}
                <div
                  className="w-3 h-full rounded-sm shadow-inner"
                  style={{ backgroundColor: COLOR_CODES[multIndex].hex }}
                  title={`Multiplier: ${COLOR_CODES[multIndex].name}`}
                />
                {/* Tolerance Band */}
                <div
                  className="w-3 h-full rounded-sm shadow-inner ml-4"
                  style={{ backgroundColor: COLOR_CODES[tolIndex].hex }}
                  title={`Tolerance: ${COLOR_CODES[tolIndex].name}`}
                />
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="font-mono text-2xl font-black text-slate-900 dark:text-emerald-400">
                {formattedResistance}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-2">
                ({COLOR_CODES[tolIndex].tol || '±20%'})
              </span>
            </div>
          </div>

          {/* Band Pickers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                1st Band (Digit)
              </label>
              <select
                value={band1}
                onChange={(e) => setBand1(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                {COLOR_CODES.slice(1, 10).map((c, i) => (
                  <option key={c.name} value={i + 1}>
                    {c.digit} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                2nd Band (Digit)
              </label>
              <select
                value={band2}
                onChange={(e) => setBand2(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                {COLOR_CODES.slice(0, 10).map((c, i) => (
                  <option key={c.name} value={i}>
                    {c.digit} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                3rd Band (Multiplier)
              </label>
              <select
                value={multIndex}
                onChange={(e) => setMultIndex(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                {COLOR_CODES.map((c, i) => (
                  <option key={c.name} value={i}>
                    ×{c.mult} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                4th Band (Tolerance)
              </label>
              <select
                value={tolIndex}
                onChange={(e) => setTolIndex(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                {COLOR_CODES.filter((c) => c.tol).map((c) => (
                  <option key={c.name} value={COLOR_CODES.indexOf(c)}>
                    {c.tol} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                addInventoryItem({
                  componentId: 'resistors-pack',
                  qty: 1,
                  condition: 'Working',
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Decoded Resistor to Inventory</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: SMD & IC Chip Lookup */}
      {activeTab === 'ic' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={icSearch}
              onChange={(e) => setIcSearch(e.target.value)}
              placeholder="Search chip markings e.g. AMS1117, NE555, TP4056, L298N..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIcs.map((ic) => (
              <div
                key={ic.code}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {ic.code}
                    </span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                      {ic.package}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-1">
                    {ic.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1">
                    <strong>Found in:</strong> {ic.source}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    <strong>Ratings:</strong> {ic.ratings}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    💡 <strong>Repurpose Idea:</strong> {ic.repurpose}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addInventoryItem({
                      componentId: ic.componentId,
                      qty: 1,
                      condition: 'Working',
                    });
                  }}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Salvaged Part</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Capacitor EIA 3-Digit Code Reader */}
      {activeTab === 'capacitor' && (
        <div className="space-y-6 max-w-xl mx-auto text-center py-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ceramic disc and film capacitors use a 3-digit number. The first two digits are the value,
            and the third is the power of 10 multiplier in picofarads (pF).
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Enter 3-Digit Code:
            </span>
            <input
              type="text"
              maxLength={3}
              value={capCode}
              onChange={(e) => setCapCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 104"
              className="w-28 text-center py-2 px-3 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500 rounded-xl font-mono text-xl font-black text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {capValue && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Picofarads (pF)</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                  {capValue.pF.toLocaleString()} pF
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Nanofarads (nF)</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                  {capValue.nF} nF
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Microfarads (µF)</div>
                <div className="font-bold text-teal-600 dark:text-teal-400 text-sm mt-0.5">
                  {capValue.uF} µF
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['104 (0.1µF)', '103 (10nF)', '223 (22nF)', '474 (0.47µF)', '102 (1nF)'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setCapCode(sample.substring(0, 3))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-mono text-slate-600 dark:text-slate-300 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
