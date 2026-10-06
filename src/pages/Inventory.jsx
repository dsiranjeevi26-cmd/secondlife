import React, { useState, useMemo } from 'react';
import {
  Layers,
  Trash2,
  Plus,
  Minus,
  Search,
  Filter,
  PackageOpen,
  Sparkles,
  AlertTriangle,
  Scale,
  RefreshCw,
  Info,
  Camera,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import PartForm from '../components/PartForm.jsx';
import TeardownPicker from '../components/TeardownPicker.jsx';
import SafetyBadge from '../components/SafetyBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CameraScannerModal from '../components/CameraScannerModal.jsx';

export default function Inventory() {
  const {
    inventory,
    catalog,
    catalogMap,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    clearInventory,
    addTeardownParts,
    loadDemoInventory,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(catalog.map((c) => c.category));
    return ['All', ...Array.from(cats).sort()];
  }, [catalog]);

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const catItem = catalogMap[item.componentId] || {};
      const name = (catItem.name || item.componentId).toLowerCase();
      const matchesSearch = !searchTerm.trim() || name.includes(searchTerm.toLowerCase().trim());
      const matchesCategory = selectedCategory === 'All' || catItem.category === selectedCategory;
      const matchesCondition = selectedCondition === 'All' || item.condition === selectedCondition;
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [inventory, catalogMap, searchTerm, selectedCategory, selectedCondition]);

  // Aggregate statistics
  const totalParts = inventory.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalWeightKg = inventory.reduce((sum, item) => {
    const catItem = catalogMap[item.componentId] || {};
    return sum + (catItem.avgWeightKg || 0.02) * (item.qty || 0);
  }, 0);
  const faultyCount = inventory.filter((i) => i.condition === 'Faulty').reduce((sum, i) => sum + i.qty, 0);
  const untestedCount = inventory.filter((i) => i.condition === 'Untested').reduce((sum, i) => sum + i.qty, 0);

  const handleQtyChange = (item, delta) => {
    const newQty = Math.max(1, (item.qty || 1) + delta);
    updateInventoryItem(item.id, { qty: newQty });
  };

  const handleConditionChange = (item, newCondition) => {
    updateInventoryItem(item.id, { condition: newCondition });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-600" />
            <span>Hardware Inventory & Scrap Log</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track loose components and salvaged hardware in your personal workshop drawer
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Component</span>
          </button>

          {inventory.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadDemoInventory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Reset Demo Inventory</span>
          </button>
        </div>
      </div>

      {/* Stats Mini Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs">
        <div>
          <div className="text-slate-500 dark:text-slate-400">Total Unique Items</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {inventory.length} types
          </div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400">Total Part Count</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalParts} units
          </div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400">Estimated Stored Mass</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1">
            <Scale className="w-4 h-4 text-slate-400" />
            <span>{(totalWeightKg * 1000).toFixed(0)} g ({totalWeightKg.toFixed(2)} kg)</span>
          </div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400">Untested / Faulty</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            <span className="text-amber-500">{untestedCount} untested</span>
            {faultyCount > 0 && <span className="text-rose-500 text-xs"> • {faultyCount} faulty</span>}
          </div>
        </div>
      </div>

      {/* Prominent Teardown Mode Card */}
      <TeardownPicker catalogMap={catalogMap} onAddSalvage={addTeardownParts} />

      {/* Add Individual Part Form */}
      <PartForm catalog={catalog} onAddPart={addInventoryItem} />

      {/* Inventory Table and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter owned components..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category & Condition Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Conditions</option>
              <option value="Working">Working</option>
              <option value="Untested">Untested</option>
              <option value="Faulty">Faulty (Disregarded)</option>
            </select>
          </div>
        </div>

        {/* Inventory List / Table */}
        {inventory.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="Your inventory is empty"
            description="You haven't listed any components yet. Use Teardown Mode above to salvage a device or load our ready-made demo inventory."
            primaryAction={{
              label: 'Load Demo Inventory',
              icon: Sparkles,
              onClick: loadDemoInventory,
            }}
          />
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No components match your search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Safety</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInventory.map((item) => {
                  const catItem = catalogMap[item.componentId] || {};
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Weight */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {catItem.name || item.componentId}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ~{((catItem.avgWeightKg || 0.02) * 1000).toFixed(0)}g each • Est. ₹{catItem.avgPriceINR || 50}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                          {catItem.category || 'Misc'}
                        </span>
                      </td>

                      {/* Safety Hazard Badge */}
                      <td className="px-4 py-3.5">
                        <SafetyBadge safety={catItem.safety || 'none'} />
                      </td>

                      {/* Quantity Stepper */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, -1)}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Condition Dropdown */}
                      <td className="px-4 py-3.5">
                        <select
                          value={item.condition}
                          onChange={(e) => handleConditionChange(item, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none transition-colors ${
                            item.condition === 'Working'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : item.condition === 'Untested'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <option value="Working">Working</option>
                          <option value="Untested">Untested</option>
                          <option value="Faulty">Faulty</option>
                        </select>
                      </td>

                      {/* Delete Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => deleteInventoryItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete from inventory"
                          aria-label="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Clear All Inventory Items?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              This will remove all {inventory.length} component types from your inventory.
              You can reload the demo set anytime.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearInventory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
}
