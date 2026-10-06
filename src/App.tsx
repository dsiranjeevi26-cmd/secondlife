import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext.jsx';
import Navbar from './components/Navbar.jsx';
import ToastContainer from './components/ToastContainer.jsx';

import Home from './pages/Home.jsx';
import Inventory from './pages/Inventory.jsx';
import Suggestions from './pages/Suggestions.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import SwapBoard from './pages/SwapBoard.jsx';
import Impact from './pages/Impact.jsx';
import LabTools from './pages/LabTools.jsx';
import RecyclingHubs from './pages/RecyclingHubs.jsx';
import { Recycle, Heart, Github } from 'lucide-react';

export default function App() {
  return (
    <InventoryProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
          {/* Header Navigation */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suggestions" element={<Suggestions />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/lab" element={<LabTools />} />
              <Route path="/swap" element={<SwapBoard />} />
              <Route path="/hubs" element={<RecyclingHubs />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Toast Notification Layer */}
          <ToastContainer />

          {/* Footer */}
          <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Recycle className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">SecondLife</span>
                <span>• E-Waste Repurposing & Component Matching Engine</span>
              </div>

              <div className="flex items-center gap-6">
                <Link to="/inventory" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Inventory
                </Link>
                <Link to="/suggestions" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Projects
                </Link>
                <Link to="/swap" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Swap Board
                </Link>
                <Link to="/impact" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  LCA Impact
                </Link>
              </div>

              <div className="flex items-center gap-1">
                <span>Designed for circular maker communities</span>
              </div>
            </div>
          </footer>
        </div>
      </HashRouter>
    </InventoryProvider>
  );
}
