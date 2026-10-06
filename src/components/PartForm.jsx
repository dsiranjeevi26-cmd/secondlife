import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Search, ChevronDown, Check, AlertCircle } from 'lucide-react';
import SafetyBadge from './SafetyBadge.jsx';

export default function PartForm({ catalog = [], onAddPart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [qty, setQty] = useState(1);
  const [condition, setCondition] = useState('Working');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCatalog = useMemo(() => {
    if (!searchTerm.trim()) return catalog;
    const term = searchTerm.toLowerCase();
    return catalog.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }, [catalog, searchTerm]);

  const selectedItem = useMemo(() => {
    return catalog.find((c) => c.id === selectedComponentId) || null;
  }, [catalog, selectedComponentId]);

  const handleSelect = (comp) => {
    setSelectedComponentId(comp.id);
    setSearchTerm(comp.name);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedComponentId) {
      return;
    }
    const cleanQty = Math.max(1, parseInt(qty, 10) || 1);
    onAddPart({
      componentId: selectedComponentId,
      qty: cleanQty,
      condition,
    });

    // Reset input state for fast sequential entry
    setSearchTerm('');
    setSelectedComponentId('');
    setQty(1);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Add Individual Component
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search parts from our catalog of microcontrollers, sensors, motors, and passives
          </p>
        </div>
        {selectedItem && (
          <SafetyBadge safety={selectedItem.safety} className="hidden sm:inline-flex" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Autocomplete Search Input */}
        <div className="sm:col-span-6 relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Component Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
                if (selectedComponentId && e.target.value !== selectedItem?.name) {
                  setSelectedComponentId('');
                }
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search e.g. Arduino Uno, SG90, 18650..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              required
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="absolute z-40 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCatalog.length === 0 ? (
                <div className="p-3 text-xs text-slate-400 text-center">
                  No matching component found in catalog
                </div>
              ) : (
                filteredCatalog.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.category} • ~{item.avgWeightKg * 1000}g • ₹{item.avgPriceINR}
                      </div>
                    </div>
                    {item.id === selectedComponentId && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        {/* Condition Selector */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          >
            <option value="Working">Working</option>
            <option value="Untested">Untested</option>
            <option value="Faulty">Faulty (Waste)</option>
          </select>
        </div>

        {/* Add Button */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!selectedComponentId}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Part</span>
          </button>
        </div>
      </div>

      {condition === 'Faulty' && (
        <p className="mt-2 text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Note: Faulty components will be stored for inventory records but never count toward project feasibility scores.
        </p>
      )}
    </form>
  );
}
