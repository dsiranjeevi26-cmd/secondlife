import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  AlertTriangle,
  Building,
  Recycle,
  Filter,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';

const RECYCLING_HUBS = [
  {
    id: 'hub-1',
    name: 'Campus Innovation Makerspace & Salvage Depot',
    type: 'Makerspace Salvage Bin',
    campus: 'Central Engineering Campus',
    location: 'Lab 102, Innovation & Tinkering Complex',
    hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    accepts: ['Loose components', 'Arduino boards', 'DC Motors', 'Sensors', 'Wires'],
    hazardCertified: true,
    contact: 'Prof. S. Ranganathan (Makerspace Lead)',
    phone: '+91 98401 23456',
    status: 'Open Now',
    notes: 'Free bin for trading components. Salvaged laptop batteries accepted after inspection.',
  },
  {
    id: 'hub-2',
    name: 'GreenEarth Certified Hazardous E-Waste Drop-off',
    type: 'Certified Recycler',
    campus: 'Technology Corridor Hub',
    location: 'Gate 4, Eco-Collection Center, Outer Ring Road',
    hours: 'Mon - Fri: 10:00 AM - 6:00 PM',
    accepts: ['Swollen Li-ion batteries', 'SMPS power supplies', 'CRT screens', 'Motherboards'],
    hazardCertified: true,
    contact: 'GreenEarth Operations Desk',
    phone: '+91 80 4123 7890',
    status: 'Open Now',
    notes: 'R2-certified hazardous e-waste recycler. Provides toxic diversion tracking certificates.',
  },
  {
    id: 'hub-3',
    name: 'Physics Department Electronics Repair Cafe',
    type: 'Community Repair Hub',
    campus: 'Science Quadrangle',
    location: 'Room 304, Solid State Physics Block',
    hours: 'Wed & Fri: 2:00 PM - 6:00 PM',
    accepts: ['Keyboards', 'Desktop fans', 'Power bricks', 'Multimeters', 'Soldering irons'],
    hazardCertified: false,
    contact: 'Student Hardware Club (Electronics Guild)',
    phone: 'ext. 4412',
    status: 'Open Wednesday',
    notes: 'Free tools, desoldering pumps, and multimeters available for testing scrap boards.',
  },
  {
    id: 'hub-4',
    name: 'City Municipal E-Waste Bin (Smart Kiosk)',
    type: 'Automated Scrap Kiosk',
    campus: 'Metro Station Gate 2',
    location: 'Kiosk B-12, Civic Amenity Center',
    hours: '24 / 7 Automated Drop-off',
    accepts: ['Old smartphones', 'Chargers', 'Cables', 'Earphones', 'Flash drives'],
    hazardCertified: true,
    contact: 'Municipal Waste Division',
    phone: 'Toll Free: 1800 200 4455',
    status: '24/7 Available',
    notes: 'Automated kiosk scans device weight and deposits credit directly to green card.',
  },
];

export default function RecyclingHubs() {
  const { addToast } = useInventory();
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHubs = RECYCLING_HUBS.filter((hub) => {
    const matchesType = filterType === 'All' || hub.type === filterType;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      hub.name.toLowerCase().includes(term) ||
      hub.location.toLowerCase().includes(term) ||
      hub.accepts.some((a) => a.toLowerCase().includes(term));
    return matchesType && matchesSearch;
  });

  const handleLogHandoff = (hubName) => {
    addToast(`Recorded hand-off at ${hubName}. Thank you for preventing landfill dumping!`, 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Recycle className="w-4 h-4" />
          <span>Circular Ecosystem Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Campus & Regional E-Waste Drop-off Hubs
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Find verified repair spaces, component salvage swaps, and hazardous certified lithium recyclers
          near your workshop.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hubs, location, or materials..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Makerspace Salvage Bin', 'Certified Recycler', 'Community Repair Hub', 'Automated Scrap Kiosk'].map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterType === type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      {/* Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHubs.map((hub) => (
          <div
            key={hub.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                  {hub.type}
                </span>

                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {hub.status}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {hub.name}
              </h3>

              <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{hub.campus}:</strong> {hub.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{hub.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {hub.contact} • {hub.phone}
                  </span>
                </div>
              </div>

              {/* Accepted materials */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Accepted Scrap & Hardware:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hub.accepts.map((mat) => (
                    <span
                      key={mat}
                      className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500 leading-relaxed italic">
                "{hub.notes}"
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {hub.hazardCertified && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Certified Safe Li-ion Handling</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleLogHandoff(hub.name)}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm shadow-emerald-950"
              >
                Log Scrap Hand-off
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
