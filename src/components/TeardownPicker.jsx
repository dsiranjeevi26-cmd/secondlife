import React, { useState } from 'react';
import teardownsData from '../data/teardowns.json';
import {
  Laptop,
  Smartphone,
  Keyboard,
  Wifi,
  Cpu,
  Disc,
  AlertTriangle,
  CheckSquare,
  Square,
  Wrench,
  DownloadCloud,
  ChevronRight,
} from 'lucide-react';
import SafetyBadge from './SafetyBadge.jsx';

const ICONS = {
  Laptop,
  Smartphone,
  Keyboard,
  Wifi,
  Cpu,
  Disc,
};

export default function TeardownPicker({ catalogMap = {}, onAddSalvage }) {
  const [selectedDeviceId, setSelectedDeviceId] = useState(teardownsData[0]?.id || 'old-laptop');
  const [selectedParts, setSelectedParts] = useState(() => {
    // By default all parts of the initial device are selected
    const initialDevice = teardownsData[0];
    const initialMap = {};
    if (initialDevice) {
      initialDevice.salvage.forEach((_, idx) => {
        initialMap[idx] = true;
      });
    }
    return initialMap;
  });

  const currentDevice = teardownsData.find((d) => d.id === selectedDeviceId) || teardownsData[0];

  const handleDeviceSelect = (device) => {
    setSelectedDeviceId(device.id);
    const newSelected = {};
    device.salvage.forEach((_, idx) => {
      newSelected[idx] = true;
    });
    setSelectedParts(newSelected);
  };

  const togglePartCheck = (idx) => {
    setSelectedParts((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleSelectAll = () => {
    const allChecked = currentDevice.salvage.every((_, idx) => selectedParts[idx]);
    const updated = {};
    currentDevice.salvage.forEach((_, idx) => {
      updated[idx] = !allChecked;
    });
    setSelectedParts(updated);
  };

  const handleAddSalvaged = () => {
    const partsToAdd = currentDevice.salvage
      .filter((_, idx) => selectedParts[idx])
      .map((item) => ({
        componentId: item.componentId,
        qty: item.qty,
        condition: item.condition,
      }));

    if (partsToAdd.length === 0) return;
    onAddSalvage(partsToAdd, currentDevice.name);
  };

  const selectedCount = currentDevice.salvage.filter((_, idx) => selectedParts[idx]).length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>Virtual Teardown Mode</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Salvage Components from Discarded Devices
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Don't know what components you have? Pick a scrap device from your home or lab.
            We'll extract all reusable parts directly into your active inventory.
          </p>
        </div>
      </div>

      {/* Device Selection Tabs / Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        {teardownsData.map((device) => {
          const IconComp = ICONS[device.icon] || Laptop;
          const isSelected = device.id === selectedDeviceId;

          return (
            <button
              key={device.id}
              type="button"
              onClick={() => handleDeviceSelect(device)}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center border transition-all ${
                isSelected
                  ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-md shadow-emerald-950'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <IconComp className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
              <span className="text-xs font-semibold leading-tight">{device.name}</span>
              <span className="text-[10px] text-slate-300/80 mt-0.5">
                {device.salvage.length} parts
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Device Teardown Panel */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/80">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/60">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{currentDevice.name}</span>
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                {currentDevice.salvage.length} Salvageable Components
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">{currentDevice.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-colors"
            >
              {currentDevice.salvage.every((_, idx) => selectedParts[idx])
                ? 'Deselect All'
                : 'Select All'}
            </button>

            <button
              type="button"
              onClick={handleAddSalvaged}
              disabled={selectedCount === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-900/50 flex items-center gap-1.5"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Add {selectedCount} Selected to Inventory</span>
            </button>
          </div>
        </div>

        {/* Safety Warnings Banner */}
        {currentDevice.warnings && currentDevice.warnings.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-300">Teardown Safety Warnings:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90 text-[11px]">
                {currentDevice.warnings.map((warn, wIdx) => (
                  <li key={wIdx}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Parts Grid with Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {currentDevice.salvage.map((item, idx) => {
            const catItem = catalogMap[item.componentId] || {};
            const isChecked = Boolean(selectedParts[idx]);

            return (
              <div
                key={idx}
                onClick={() => togglePartCheck(idx)}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-400 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="mt-0.5 text-emerald-400 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate text-slate-100">
                    {catItem.name || item.componentId}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-1">
                    <span>Qty: <strong className="text-white">{item.qty}</strong></span>
                    <span>•</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-medium ${
                        item.condition === 'Working'
                          ? 'bg-emerald-900/70 text-emerald-300'
                          : 'bg-amber-900/70 text-amber-300'
                      }`}
                    >
                      {item.condition}
                    </span>
                    <span>•</span>
                    <span>~{((catItem.avgWeightKg || 0.02) * 1000).toFixed(0)}g</span>
                  </div>
                </div>

                {catItem.safety && catItem.safety !== 'none' && (
                  <SafetyBadge safety={catItem.safety} className="scale-75 origin-top-right shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
