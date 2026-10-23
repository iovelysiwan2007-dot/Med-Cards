'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Award, Flame, ChevronRight, Activity, RotateCcw, Puzzle, Trophy, Compass, Star, LogOut, UserCheck, User, Layers, Sun, Moon, Brain, Clipboard } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePhysio } from '../context/PhysioContext';
import { useTheme, useLanguage } from '../context/ThemeLanguageContext';
import { getLevelInfo } from '../lib/utils';
import Navigation from '../components/Navigation';

const ClinicalIQOnboarding = dynamic(() => import('../components/ClinicalIQOnboarding'), { ssr: false });

export default function HomeDashboard() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { completedMuscles, todayCompleted, streak, xp, isLoading, resetProgress, studentName, studentCourse, learnedAnatomy } = usePhysio();

  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('clinicaliq_onboarding_completed') === 'true';
    
    let logged = localStorage.getItem('clinicaliq_logged_in') === 'true';
    if (localStorage.getItem('clinicaliq_logged_in') === null) {
      logged = localStorage.getItem('medcards_logged_in') === 'true';
    }
    
    let onboarded = localStorage.getItem('clinicaliq_onboarded') === 'true';
    if (localStorage.getItem('clinicaliq_onboarded') === null) {
      onboarded = localStorage.getItem('medcards_onboarded') === 'true';
    }
    
    if (!onboardingCompleted) {
      setIsLogged(false);
      setIsOnboarded(false);
    } else {
      setIsLogged(logged);
      setIsOnboarded(onboarded);
    }
    setCheckingAuth(false);
  }, []);

  const handleOnboardComplete = () => {
    setIsLogged(true);
    setIsOnboarded(true);
  };

  const completedCount = todayCompleted.length;
  const progressPercent = Math.min(100, (completedCount / 5) * 100);
  const isFinishedToday = completedCount === 5;
  const levelInfo = getLevelInfo(xp);

  if (isLoading || checkingAuth) {
    return (
      <div className="w-full min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 text-teal-400 animate-pulse" />
          <p className="text-sm font-semibold text-slate-400 tracking-wider">
            {t('loading') || 'Loading ClinicalIQ...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isLogged || !isOnboarded) {
    return <ClinicalIQOnboarding onComplete={handleOnboardComplete} />;
  }

  return (
    <div className="w-full flex flex-col gap-3 relative bg-slate-950 text-slate-100 px-4 pt-1 pb-3">
      {/* Top Header - Compact 56-64px */}
      <header className="w-full h-14 flex items-center justify-between sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 py-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Layers className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight leading-none">ClinicalIQ</h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Learn. Solve. Master.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-teal-400 rounded-xl bg-slate-900 border border-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            title="Toggle theme"
            id="btn-toggle-theme-header"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>

          <Link
            href="/profile"
            className="p-2 text-slate-400 hover:text-teal-400 rounded-xl bg-slate-900 border border-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            title="My Profile & Settings"
            id="btn-header-profile"
          >
            <User className="h-4 w-4" />
          </Link>

          <button 
            onClick={() => {
              if (confirm(t('confirmLogout') || "Are you sure you want to reset all your game progress, levels, and XP?")) {
                resetProgress();
              }
            }}
            className="p-2 text-slate-500 hover:text-rose-400 rounded-xl bg-slate-900 border border-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            title="Reset Progress"
            id="btn-reset-progress"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col gap-3.5">
        {/* Mobile-first 3-Column Info Hub */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* Col 1: Colleague Session */}
          <Link
            href="/profile"
            className="bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between hover:border-teal-500/40 transition-all active:scale-98"
          >
            <span className="text-[9px] font-bold uppercase text-teal-400 tracking-wider">Colleague</span>
            <h4 className="text-sm font-black text-slate-100 truncate mt-1 leading-tight">
              {studentName?.split(' ')[0] || 'Dr. Guest'}
            </h4>
            <span className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
              {studentCourse || 'MBBS / BPT'}
            </span>
          </Link>

          {/* Col 2: Level & Total XP */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-bold uppercase text-blue-400 tracking-wider">Rank</span>
            <h4 className="text-sm font-black text-slate-100 truncate mt-1 leading-tight">
              {levelInfo.label.replace('Rank', '').trim()}
            </h4>
            <span className="text-[10px] font-bold text-slate-500 mt-0.5">
              {xp} XP
            </span>
          </div>

          {/* Col 3: Streak Tracker */}
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-0.5">
              <Flame className="h-3 w-3 text-amber-500 fill-amber-500" /> Streak
            </span>
            <h4 className="text-sm font-black text-amber-300 mt-1 leading-tight">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </h4>
            <span className="text-[10px] font-bold text-amber-500/70 mt-0.5">
              Continuous
            </span>
          </div>
        </div>

        {/* Daily Goal Tracker - Full Width */}
        <section className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-200 tracking-tight uppercase tracking-wider">Daily Goal Tracker</h2>
              <p className="text-xs text-slate-500 mt-0.5">Solve daily anatomical challenges</p>
            </div>
            <span className="text-sm font-black text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-lg border border-teal-500/15">
              {completedCount}/5 Solved
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-full bg-slate-800 border border-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 font-medium pt-0.5">
              <span>{isFinishedToday ? 'Daily target reached! 🎉' : `${5 - completedCount} more to master today`}</span>
              <span className="font-bold text-slate-300">{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </section>

        {/* Learning Actions - Responsive single/double col layout */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Main learning actions</h2>
            <span className="h-px bg-slate-800 flex-1 ml-4" />
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 w-full">
            {/* Action 1: Anatomy Challenge */}
            <div className="bg-gradient-to-br from-blue-900/60 to-blue-950/80 border border-blue-500/20 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between min-h-[128px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-blue-400/10 rounded-full blur-xl" />
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Puzzle className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-black bg-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/20">
                  Daily Puzzle
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-base font-bold tracking-tight">Anatomy Challenge</h3>
                <p className="text-[11px] text-blue-200 mt-1 leading-relaxed line-clamp-1">Solve muscles from anatomical clues</p>
              </div>
              <Link
                href="/play"
                className="w-full bg-white text-blue-950 font-black py-2 px-3 rounded-lg text-xs hover:bg-blue-50 text-center transition-all mt-3 uppercase tracking-wider block shadow-sm active:scale-98"
                id="play-puzzle-link"
              >
                {isFinishedToday ? 'Review Daily' : 'Play Today'}
              </Link>
            </div>

            {/* Action 2: Flashcards Arena */}
            <div className="bg-gradient-to-br from-indigo-900/60 to-indigo-950/80 border border-indigo-500/20 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between min-h-[128px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-indigo-400/10 rounded-full blur-xl" />
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-black bg-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-400/20">
                  Active Recall
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-base font-bold tracking-tight">Flashcards Arena</h3>
                <p className="text-[11px] text-indigo-200 mt-1 leading-relaxed line-clamp-1">Master 30 premium muscles</p>
              </div>
              <Link
                href="/flashcards"
                className="w-full bg-white text-indigo-950 font-black py-2 px-3 rounded-lg text-xs hover:bg-indigo-50 text-center transition-all mt-3 uppercase tracking-wider block shadow-sm active:scale-98"
                id="link-flashcards"
              >
                Launch Arena
              </Link>
            </div>

            {/* Action 3: Anatomy Library */}
            <div className="bg-gradient-to-br from-violet-900/60 to-violet-950/80 border border-violet-500/20 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between min-h-[128px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-violet-400/10 rounded-full blur-xl" />
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Compass className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-black bg-violet-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider border border-violet-400/20">
                  Database
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-base font-bold tracking-tight">Anatomy Library</h3>
                <p className="text-[11px] text-violet-200 mt-1 leading-relaxed line-clamp-1">Origins, insertions, actions & innervations</p>
              </div>
              <Link
                href="/anatomy"
                className="w-full bg-white text-violet-950 font-black py-2 px-3 rounded-lg text-xs hover:bg-violet-50 text-center transition-all mt-3 uppercase tracking-wider block shadow-sm active:scale-98"
                id="link-anatomy-upgrade"
              >
                Browse Library
              </Link>
            </div>

            {/* Action 4: Clinical Reasoning Lab */}
            <div className="bg-gradient-to-br from-rose-900/60 to-rose-950/80 border border-rose-500/20 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between min-h-[128px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-rose-400/10 rounded-full blur-xl" />
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-black bg-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider border border-rose-400/20">
                  Simulations
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-base font-bold tracking-tight">Clinical Reasoning</h3>
                <p className="text-[11px] text-rose-200 mt-1 leading-relaxed line-clamp-1">Diagnose and treat pathologies</p>
              </div>
              <Link
                href="/clinical-lab"
                className="w-full bg-white text-rose-950 font-black py-2 px-3 rounded-lg text-xs hover:bg-rose-50 text-center transition-all mt-3 uppercase tracking-wider block shadow-sm active:scale-98"
                id="link-clinical-lab"
              >
                Open Lab
              </Link>
            </div>
          </div>
        </section>

        {/* Progress Journey - Full Width with compact stat cards */}
        <section className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your Progress Journey</h2>
              <p className="text-xs text-slate-500">Continuous recall database complete</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/10">Active</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-center space-y-1">
              <span className="block text-2xl font-black text-slate-100">{learnedAnatomy?.length || 0}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sketched Muscles</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-center space-y-1">
              <span className="block text-2xl font-black text-teal-400">{completedMuscles.length}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mastered</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Sticky Navigation */}
      <Navigation />
    </div>
  );
}
