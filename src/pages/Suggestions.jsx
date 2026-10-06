import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  SlidersHorizontal,
  PackageOpen,
  ArrowUpDown,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Suggestions() {
  const { rankedProjects, inventory, loadDemoInventory } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [buildableOnly, setBuildableOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('best'); // 'best' | 'least-missing' | 'difficulty' | 'time'

  // Extract all unique tags across all projects
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    rankedProjects.forEach((m) => {
      m.project.tags.forEach((t) => tagsSet.add(t));
    });
    return ['All', ...Array.from(tagsSet).sort()];
  }, [rankedProjects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return rankedProjects
      .filter((match) => {
        const { project, score, canBuildNow } = match;

        // Search term in title or description or tags
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = project.title.toLowerCase().includes(term);
          const matchDesc = project.description.toLowerCase().includes(term);
          const matchTags = project.tags.some((t) => t.toLowerCase().includes(term));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }

        // Difficulty filter
        if (selectedDifficulty !== 'All' && project.difficulty !== selectedDifficulty) {
          return false;
        }

        // Tag filter
        if (selectedTag !== 'All' && !project.tags.includes(selectedTag)) {
          return false;
        }

        // Buildable now toggle
        if (buildableOnly && !canBuildNow) {
          return false;
        }

        // Min score slider
        if (score < minScore) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'best') {
          return b.score - a.score;
        }
        if (sortBy === 'least-missing') {
          return a.totalMissingCount - b.totalMissingCount;
        }
        if (sortBy === 'time') {
          return a.project.timeHours - b.project.timeHours;
        }
        if (sortBy === 'difficulty') {
          const map = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          return (map[a.project.difficulty] || 2) - (map[b.project.difficulty] || 2);
        }
        return 0;
      });
  }, [rankedProjects, searchTerm, selectedDifficulty, selectedTag, buildableOnly, minScore, sortBy]);

  const readyToBuildCount = rankedProjects.filter((m) => m.canBuildNow).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-500" />
            <span>Feasibility-Matched Project Suggestions</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            20 predefined repurposing projects ranked by your active components, substitutes, and missing parts
          </p>
        </div>

        {readyToBuildCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{readyToBuildCount} Project{readyToBuildCount > 1 ? 's' : ''} Ready to Build 100%!</span>
          </div>
        )}
      </div>

      {/* Control Panel: Filters, Search, Slider, Sorting */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by name, sensor, or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Difficulty Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner (1-2 hrs)</option>
              <option value="Intermediate">Intermediate (2-4 hrs)</option>
              <option value="Advanced">Advanced (4+ hrs)</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Tags</option>
              {allTags.filter((t) => t !== 'All').map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="best">Sort: Best Match</option>
              <option value="least-missing">Least Missing Parts</option>
              <option value="difficulty">Easiest First</option>
              <option value="time">Shortest Time</option>
            </select>
          </div>
        </div>

        {/* Second Row: Toggle & Score Slider */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Buildable Now Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={buildableOnly}
              onChange={(e) => setBuildableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Buildable Now Only (100% components owned)
            </span>
          </label>

          {/* Minimum Score Slider */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Min Feasibility Score: <strong className="text-emerald-600 dark:text-emerald-400">{minScore}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              className="w-28 sm:w-36 accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredProjects.length}</strong> of{' '}
          {rankedProjects.length} total projects
        </span>

        {inventory.length === 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            (Inventory empty: Showing baseline missing requirements)
          </span>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No projects match these filters"
          description="Try lowering the minimum feasibility slider, toggling off 'Buildable now', or loading our demo inventory."
          primaryAction={{
            label: 'Reset Filters',
            onClick: () => {
              setSearchTerm('');
              setSelectedDifficulty('All');
              setSelectedTag('All');
              setBuildableOnly(false);
              setMinScore(0);
            },
          }}
          secondaryAction={{
            label: 'Load Demo Inventory',
            icon: Sparkles,
            onClick: loadDemoInventory,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((match) => (
            <ProjectCard key={match.project.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
