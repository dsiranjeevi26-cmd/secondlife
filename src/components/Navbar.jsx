import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Recycle,
  Layers,
  Sparkles,
  ArrowRightLeft,
  BarChart3,
  Sun,
  Moon,
  Menu,
  X,
  Package,
  Activity,
  MapPin,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { inventory, rankedProjects, darkMode, toggleDarkMode, loadDemoInventory } = useInventory();

  const totalPartsCount = inventory.reduce((sum, item) => sum + (item.qty || 0), 0);
  const readyProjectsCount = rankedProjects.filter((p) => p.canBuildNow).length;

  const navLinks = [
    { to: '/', label: 'Home', icon: Recycle },
    {
      to: '/inventory',
      label: 'Inventory',
      icon: Layers,
      badge: totalPartsCount > 0 ? totalPartsCount : null,
    },
    {
      to: '/suggestions',
      label: 'Suggestions',
      icon: Sparkles,
      badge: readyProjectsCount > 0 ? `${readyProjectsCount} ready` : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    { to: '/lab', label: 'Lab Tools', icon: Activity },
    { to: '/swap', label: 'Swap Board', icon: ArrowRightLeft },
    { to: '/hubs', label: 'Drop-off Hubs', icon: MapPin },
    { to: '/impact', label: 'Impact', icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>SecondLife</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  E-Waste
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:block">
                Repurpose & Upcycle Platform
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        link.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions & Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* Quick Demo Button if inventory is empty */}
            {inventory.length === 0 && (
              <button
                type="button"
                onClick={loadDemoInventory}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors"
                title="Populate demo inventory to preview matches"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Load Demo</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      link.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {inventory.length === 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  loadDemoInventory();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-600 text-white flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Load Demo Inventory</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
