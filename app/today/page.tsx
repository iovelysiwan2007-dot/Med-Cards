'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, CheckCircle2 } from 'lucide-react';
import { usePhysio } from '../../context/PhysioContext';
import { muscles, TODAYS_MUSCLE_IDS } from '../../data/muscles';
import MuscleCard from '../../components/MuscleCard';
import Navigation from '../../components/Navigation';

export default function TodayMuscles() {
  const { completedMuscles, todayCompleted, isLoading } = usePhysio();

  // Get today's 5 muscles in the correct order
  const todaysMuscles = TODAYS_MUSCLE_IDS.map((id) =>
    muscles.find((m) => m.id === id)
  ).filter(Boolean);

  const completedCount = todayCompleted.length;
  const isFinishedToday = completedCount === 5;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-900 pb-4 font-sans relative w-full flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-3 px-3 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 pr-3"
            id="back-to-home-link"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Session</span>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{completedCount} / 5 Done</p>
          </div>
        </div>
      </header>

      <main className="w-full px-4 pt-4 space-y-4">
        {/* Title Section */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-sans">Today&apos;s 5 Muscles</h2>
          <p className="text-sm text-slate-500">
            Study their anatomical attributes here, then test your memory in the Arena!
          </p>
        </div>

        {/* Puzzle Arena Quick Entry Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold tracking-widest bg-white/20 px-2 py-0.5 rounded">CHALLENGE READY</span>
            <h4 className="font-bold text-sm">Play Today&apos;s Arena Puzzle</h4>
            <p className="text-[11px] text-blue-100">Test Origin, Insertion, Action, and Nerve Supply.</p>
          </div>
          <Link 
            href="/play" 
            className="shrink-0 bg-white text-blue-600 font-extrabold text-xs px-3 py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all"
          >
            PLAY NOW →
          </Link>
        </div>

        {/* Completion Celebration Message */}
        {isFinishedToday && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-800 text-sm">Today&apos;s Deck Completed!</h4>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Outstanding! You have mastered all 5 muscles for today. Your progress has been updated. Keep it up tomorrow!
              </p>
            </div>
          </div>
        )}

        {/* 5 Compact Cards */}
        <div className="space-y-3" id="todays-muscle-list">
          {todaysMuscles.map((muscle) => {
            if (!muscle) return null;
            const isCompleted = completedMuscles.includes(muscle.id);
            return (
              <MuscleCard
                key={muscle.id}
                muscle={muscle}
                isCompleted={isCompleted}
                id={`today-muscle-card-${muscle.id}`}
              />
            );
          })}
        </div>
      </main>

      <Navigation />
    </div>
  );
}
