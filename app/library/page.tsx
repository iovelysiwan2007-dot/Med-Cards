'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Activity } from 'lucide-react';
import { usePhysio } from '../../context/PhysioContext';
import { muscles, Muscle } from '../../data/muscles';
import MuscleCard from '../../components/MuscleCard';
import Navigation from '../../components/Navigation';

type RegionFilter = 'All' | 'Upper Limb' | 'Lower Limb' | 'Trunk';

export default function MuscleLibrary() {
  const { completedMuscles, isLoading } = usePhysio();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('All');

  // Filter muscles based on search query and selected region
  const filteredMuscles = useMemo(() => {
    return muscles.filter((muscle) => {
      const matchesSearch = muscle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        muscle.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = selectedRegion === 'All' || muscle.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
      </div>
    );
  }

  const regions: RegionFilter[] = ['All', 'Upper Limb', 'Lower Limb', 'Trunk'];

  return (
    <div className="h-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-900 pb-4 font-sans relative w-full flex flex-col">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-3 px-3 sticky top-0 z-40">
        <div className="w-full">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Muscle Library</span>
          </h2>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
            All 30 High-Yield Muscles
          </p>
        </div>
      </header>

      <main className="w-full px-4 pt-4 space-y-3">
        {/* Link to Complete Anatomy Database */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-4 rounded-2xl text-white shadow-xs space-y-2.5">
          <div>
            <span className="text-[9px] font-black tracking-widest bg-white/20 px-2 py-0.5 rounded uppercase">Anatomy Expansion</span>
            <h4 className="text-sm font-black tracking-tight mt-1">Complete Human Anatomy Database</h4>
            <p className="text-[10px] text-violet-100 leading-relaxed mt-0.5">
              Access 47 major skeletal muscles with precise nerve root values, clinical mnemonics, and palpation notes!
            </p>
          </div>
          <Link
            href="/anatomy"
            className="w-full inline-flex items-center justify-center bg-white text-violet-700 text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-xs hover:bg-violet-50 transition-all"
            id="library-anatomy-shortcut"
          >
            Open Complete Anatomy Library →
          </Link>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by muscle name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 focus:border-blue-300 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-hidden transition-all placeholder:text-slate-400 shadow-xs"
            id="search-library-input"
          />
        </div>

        {/* Region Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-100 text-slate-500 hover:text-slate-800'
              }`}
              id={`filter-tab-${region.toLowerCase().replace(' ', '-')}`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* List Count Summary */}
        <div className="flex justify-between items-center text-xs text-slate-400 font-medium px-1">
          <span>Showing {filteredMuscles.length} muscles</span>
          <span>
            {completedMuscles.length} / 30 Learned
          </span>
        </div>

        {/* Muscle Grid List */}
        {filteredMuscles.length > 0 ? (
          <div className="space-y-3" id="library-muscle-list">
            {filteredMuscles.map((muscle) => {
              const isCompleted = completedMuscles.includes(muscle.id);
              return (
                <MuscleCard
                  key={muscle.id}
                  muscle={muscle}
                  isCompleted={isCompleted}
                  id={`library-muscle-card-${muscle.id}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
            <p className="text-slate-400 text-sm font-medium">No muscles found matching your query.</p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
