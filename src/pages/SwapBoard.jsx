import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Search,
  Plus,
  Sparkles,
  MapPin,
  User,
  Clock,
  Trash2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Send,
  Filter,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import SafetyBadge from '../components/SafetyBadge.jsx';

export default function SwapBoard() {
  const {
    swapPosts,
    addSwapPost,
    deleteSwapPost,
    catalog,
    catalogMap,
    inventory,
    rankedProjects,
  } = useInventory();

  const [activeTab, setActiveTab] = useState('offering'); // 'offering' | 'looking'
  const [searchTerm, setSearchTerm] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // New post form state
  const [postType, setPostType] = useState('offering');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partSearch, setPartSearch] = useState('');
  const [postQty, setPostQty] = useState(1);
  const [postNote, setPostNote] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactLocation, setContactLocation] = useState('');

  // 1. Calculate missing parts from user's top 5 ranked projects
  const neededMissingPartIds = useMemo(() => {
    const ids = new Set();
    const topProjects = rankedProjects.slice(0, 5);
    for (const match of topProjects) {
      for (const missing of match.missingParts) {
        ids.add(missing.componentId);
      }
    }
    return ids;
  }, [rankedProjects]);

  // 2. Calculate parts in user's inventory with surplus/available working stock
  const ownedWorkingPartIds = useMemo(() => {
    const ids = new Set();
    for (const item of inventory) {
      if (item.condition !== 'Faulty' && item.qty > 0) {
        ids.add(item.componentId);
      }
    }
    return ids;
  }, [inventory]);

  // Filter posts that match user needs
  // (Posts offering parts that user is missing for top projects)
  const matchesForUserOffers = useMemo(() => {
    return swapPosts.filter(
      (p) => p.type === 'offering' && neededMissingPartIds.has(p.componentId)
    );
  }, [swapPosts, neededMissingPartIds]);

  // (Posts looking for parts that user actually owns)
  const matchesForUserRequests = useMemo(() => {
    return swapPosts.filter(
      (p) => p.type === 'looking' && ownedWorkingPartIds.has(p.componentId)
    );
  }, [swapPosts, ownedWorkingPartIds]);

  // Current tab posts
  const filteredPosts = useMemo(() => {
    return swapPosts
      .filter((p) => p.type === activeTab)
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const partName = (catalogMap[p.componentId]?.name || '').toLowerCase();
        const note = (p.note || '').toLowerCase();
        const contact = (p.contactName || '').toLowerCase();
        const loc = (p.contactLocation || '').toLowerCase();
        return (
          partName.includes(term) ||
          note.includes(term) ||
          contact.includes(term) ||
          loc.includes(term)
        );
      });
  }, [swapPosts, activeTab, searchTerm, catalogMap]);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!selectedPartId) return;

    addSwapPost({
      type: postType,
      componentId: selectedPartId,
      qty: Math.max(1, parseInt(postQty, 10) || 1),
      note: postNote.trim(),
      contactName: contactName.trim() || 'Anonymous Maker',
      contactLocation: contactLocation.trim() || 'Campus Makerspace',
    });

    // Reset
    setShowPostModal(false);
    setSelectedPartId('');
    setPartSearch('');
    setPostQty(1);
    setPostNote('');
    setContactName('');
    setContactLocation('');
  };

  const filteredCatalogForSelect = useMemo(() => {
    if (!partSearch.trim()) return catalog;
    const term = partSearch.toLowerCase();
    return catalog.filter((c) => c.name.toLowerCase().includes(term));
  }, [catalog, partSearch]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ArrowRightLeft className="w-7 h-7 text-emerald-600" />
            <span>Campus & Peer Component Swap Board</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Exchange spare sensors, microcontrollers, and batteries with local makers to complete builds
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Swap Post</span>
        </button>
      </div>

      {/* "Matches For You" Intelligent Banner */}
      {(matchesForUserOffers.length > 0 || matchesForUserRequests.length > 0) && (
        <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Smart Matchmaking Insights For Your Workshop</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Parts you need that others offer */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                🎁 Parts Offered That Complete Your Top Projects:
              </span>
              {matchesForUserOffers.length > 0 ? (
                <ul className="space-y-1">
                  {matchesForUserOffers.map((p) => {
                    const comp = catalogMap[p.componentId];
                    return (
                      <li key={p.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span>
                          <strong>{p.qty}x {comp?.name || p.componentId}</strong> by {p.contactName}
                        </span>
                        <span className="text-slate-400 text-[11px]">{p.contactLocation}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-slate-400">No active offers for your missing project parts right now.</p>
              )}
            </div>

            {/* Parts you own that others are requesting */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-teal-200/60 dark:border-teal-900/50">
              <span className="font-bold text-teal-700 dark:text-teal-400 block mb-1">
                🤝 Fellow Makers Looking For Parts You Own:
              </span>
              {matchesForUserRequests.length > 0 ? (
                <ul className="space-y-1">
                  {matchesForUserRequests.map((p) => {
                    const comp = catalogMap[p.componentId];
                    return (
                      <li key={p.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span>
                          <strong>{p.qty}x {comp?.name || p.componentId}</strong> wanted by {p.contactName}
                        </span>
                        <span className="text-slate-400 text-[11px]">{p.contactLocation}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-slate-400">No requests match your current owned parts yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Two Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('offering')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'offering'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Offering Parts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {swapPosts.filter((p) => p.type === 'offering').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('looking')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'looking'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Looking For Parts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {swapPosts.filter((p) => p.type === 'looking').length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'offering' ? 'offers' : 'requests'}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Posts Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <ArrowRightLeft className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No posts found in this section
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Be the first to create a post offering surplus parts or requesting components you need!
          </p>
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            Create a Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const comp = catalogMap[post.componentId] || {};
            const isMissingForUser = neededMissingPartIds.has(post.componentId);
            const isOwnedByUser = ownedWorkingPartIds.has(post.componentId);

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all relative"
              >
                <div>
                  {/* Top Status Tags */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        post.type === 'offering'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                      }`}
                    >
                      {post.type === 'offering' ? 'Offering' : 'Looking For'}
                    </span>

                    {post.type === 'offering' && isMissingForUser && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        ⚡ Matches Your Project!
                      </span>
                    )}

                    {post.type === 'looking' && isOwnedByUser && (
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-800">
                        📦 In Your Inventory!
                      </span>
                    )}
                  </div>

                  {/* Component Title & Qty */}
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
                      {comp.name || post.componentId}
                    </h3>
                    <span className="shrink-0 font-extrabold text-sm px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200">
                      ×{post.qty}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>{comp.category || 'Misc'}</span>
                    {comp.safety && comp.safety !== 'none' && (
                      <SafetyBadge safety={comp.safety} className="scale-75 origin-left" />
                    )}
                  </div>

                  {/* Note */}
                  {post.note && (
                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{post.note}"
                    </p>
                  )}
                </div>

                {/* Footer with Contact Info & Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.contactName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{post.contactLocation}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteSwapPost(post.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove post"
                    aria-label="Delete post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Create Swap Board Post
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Offer extra hardware to friends or request parts you need to finish a build.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Type Radio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Post Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('offering')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      postType === 'offering'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Offering (I have spare parts)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('looking')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      postType === 'looking'
                        ? 'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Looking For (I need this part)
                  </button>
                </div>
              </div>

              {/* Component Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Component *
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a component from catalog...</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={postQty}
                  onChange={(e) => setPostQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Condition Note
                </label>
                <textarea
                  rows={2}
                  value={postNote}
                  onChange={(e) => setPostNote(e.target.value)}
                  placeholder="e.g. Desoldered from working desktop, tested, free to a good home!"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Rohan"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Lab Room
                  </label>
                  <input
                    type="text"
                    value={contactLocation}
                    onChange={(e) => setContactLocation(e.target.value)}
                    placeholder="e.g. Robotics Lab 102"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
