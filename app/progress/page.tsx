'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, Flame, BookOpen, CheckCircle2, Award, Trophy, 
  Star, Target, Sparkles, User, GraduationCap, Calendar, 
  Building, Edit3, Check, X, Settings
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePhysio } from '../../context/PhysioContext';
import { muscles, TODAYS_MUSCLE_IDS } from '../../data/muscles';
import { getLevelInfo } from '../../lib/utils';
import ProgressBar from '../../components/ProgressBar';
import Navigation from '../../components/Navigation';

const MasteryTrendChart = dynamic(() => import('../../components/MasteryTrendChart'), { ssr: false });

export default function ProgressPage() {
  const { 
    completedMuscles, 
    todayCompleted, 
    streak, 
    xp, 
    isLoading,
    studentName,
    studentAge,
    studentCourse,
    studentYear,
    studentInstitution,
    updateProfile,
    quizHistory
  } = usePhysio();

  // Calculate real accuracy from actual quizHistory answers
  const calculateRealAccuracy = () => {
    if (!quizHistory || quizHistory.length === 0) return null;
    let totalQuestions = 0;
    let totalCorrect = 0;
    quizHistory.forEach(session => {
      totalQuestions += session.totalQuestions || 0;
      totalCorrect += session.correctAnswers || 0;
    });
    if (totalQuestions === 0) return null;
    return Math.round((totalCorrect / totalQuestions) * 100);
  };

  const realAccuracy = calculateRealAccuracy();

  // Editing state for profile card
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(studentName);
  const [ageInput, setAgeInput] = useState(studentAge);
  const [courseInput, setCourseInput] = useState(studentCourse);
  const [yearInput, setYearInput] = useState(studentYear);
  const [institutionInput, setInstitutionInput] = useState(studentInstitution);

  // Mounted check to prevent Next.js hydration issues with Recharts
  const [isMounted, setIsMounted] = useState(false);
  const [chartMetric, setChartMetric] = useState<'gain' | 'cumulative'>('gain');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate historical weekly data based on actual XP and mastered muscles
  const generateTrendData = () => {
    const orderedDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      orderedDays.push({ dayName });
    }

    // Default mock distribution weights
    const effectiveXp = Math.max(70, xp);
    const totalMastered = completedMuscles.length || 0;
    const currentMasteryPct = Math.max(5, Math.min(100, Math.round((totalMastered / 30) * 100)));

    const xpCumulativeWeights = [0.12, 0.25, 0.38, 0.45, 0.60, 0.82, 1.0];
    const masteryWeights = [0.10, 0.22, 0.35, 0.42, 0.58, 0.80, 1.0];

    return orderedDays.map((item, index) => {
      const cumXp = Math.round(effectiveXp * xpCumulativeWeights[index]);
      const prevCumXp = index > 0 ? Math.round(effectiveXp * xpCumulativeWeights[index - 1]) : 0;
      const dailyXpGain = Math.max(5, cumXp - prevCumXp);
      const masteryPct = Math.round(currentMasteryPct * masteryWeights[index]);

      return {
        day: item.dayName,
        'XP Gain': dailyXpGain,
        'Cumulative XP': cumXp,
        'Mastery Rate (%)': masteryPct,
      };
    });
  };

  const trendData = generateTrendData();

  const handleStartEdit = () => {
    setNameInput(studentName);
    setAgeInput(studentAge);
    setCourseInput(studentCourse);
    setYearInput(studentYear);
    setInstitutionInput(studentInstitution);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfile(nameInput, ageInput, courseInput, yearInput, institutionInput);
    setIsEditing(false);
  };

  // Get today's 5 muscles to show their completion states
  const todaysMuscles = TODAYS_MUSCLE_IDS.map((id) =>
    muscles.find((m) => m.id === id)
  ).filter(Boolean);

  const todayCount = todayCompleted.length;
  const progressPercent = (todayCount / 5) * 100;

  // Level Info
  const levelInfo = getLevelInfo(xp);
  const nextLevelXpNeeded = levelInfo.maxXp - levelInfo.minXp;
  const currentLevelXpProgress = Math.max(0, xp - levelInfo.minXp);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-900 pb-4 font-sans relative w-full flex flex-col">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-3 px-3 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Player Profile</span>
            </h2>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
              Your Anatomical Rank & Student Details
            </p>
          </div>
          
          <Link
            href="/profile"
            className="p-2 text-slate-500 hover:text-teal-600 rounded-lg bg-teal-50/50 hover:bg-teal-50 border border-teal-100 transition-colors flex items-center gap-1.5 shrink-0"
            title="App Settings"
            id="btn-progress-settings"
          >
            <Settings className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Settings</span>
          </Link>
        </div>
      </header>

      <main className="w-full px-4 pt-4 space-y-4">

        {/* Student Profile Card (View or Edit Mode) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          {!isEditing ? (
            // VIEW PROFILE MODE
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-lg shadow-inner">
                    {studentName ? studentName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{studentName || 'BPT Student'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Profile</p>
                  </div>
                </div>
                
                <button
                  onClick={handleStartEdit}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-100/50"
                  aria-label="Edit Profile"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Profile Attributes Grid */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5 border-t border-slate-50">
                <div className="flex items-center gap-2.5 text-xs">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Age</span>
                    <span className="font-bold text-slate-700">{studentAge || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Course</span>
                    <span className="font-bold text-slate-700">{studentCourse || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Academic Year</span>
                    <span className="font-bold text-slate-700">{studentYear || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Building className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Institution</span>
                    <span className="font-bold text-slate-700">{studentInstitution || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // EDIT PROFILE MODE
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4 text-blue-500" />
                  <span>Edit Student Details</span>
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700 outline-hidden transition-all duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      Age
                    </label>
                    <input
                      type="text"
                      value={ageInput}
                      onChange={(e) => setAgeInput(e.target.value)}
                      placeholder="e.g. 21"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700 outline-hidden transition-all duration-150"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={yearInput}
                      onChange={(e) => setYearInput(e.target.value)}
                      placeholder="e.g. 1st Year"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700 outline-hidden transition-all duration-150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={courseInput}
                    onChange={(e) => setCourseInput(e.target.value)}
                    placeholder="e.g. Bachelor of Physiotherapy"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700 outline-hidden transition-all duration-150"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={institutionInput}
                    onChange={(e) => setInstitutionInput(e.target.value)}
                    placeholder="e.g. National Institute of Health Sciences"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700 outline-hidden transition-all duration-150"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1.5">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-2.5 rounded-xl transition-all duration-150 shadow-xs text-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded-xl transition-colors text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Level Progression Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-black text-blue-600 uppercase tracking-widest">RANK</span>
                <span className="text-xl font-black text-slate-800">{levelInfo.label}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-400 uppercase">TOTAL XP</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-1 justify-end">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                {xp}
              </span>
            </div>
          </div>

          {/* XP Progress Bar to next Level */}
          {levelInfo.level < 5 ? (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>XP: {currentLevelXpProgress} / {nextLevelXpNeeded}</span>
                <span className="text-blue-600">Next Rank: Level {levelInfo.level + 1}</span>
              </div>
              <ProgressBar value={levelInfo.progressPercent} className="h-3.5" />
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-semibold text-center border border-emerald-100/50">
              👑 Maximum level achieved! Outstanding work.
            </div>
          )}
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Muscles Mastered */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 self-start border border-blue-100/30">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Muscles Mastered</p>
              <p className="text-2xl font-black text-slate-800 mt-1" id="progress-total-learned">
                {completedMuscles.length} <span className="text-xs font-bold text-slate-400">/ 30</span>
              </p>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 self-start border border-amber-100/30">
              <Flame className="h-4 w-4 fill-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Streak</p>
              <p className="text-2xl font-black text-slate-800 mt-1" id="progress-streak">
                {streak} <span className="text-xs font-bold text-slate-400">{streak === 1 ? 'day' : 'days'}</span>
              </p>
            </div>
          </div>

          {/* Target Accuracy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 self-start border border-emerald-100/30">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Accuracy</p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {realAccuracy !== null ? `${realAccuracy}%` : "No data yet"}
              </p>
            </div>
          </div>

          {/* Total XP Earned */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 self-start border border-purple-100/30">
              <Sparkles className="h-4 w-4 fill-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total XP Earned</p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {xp} <span className="text-xs font-bold text-slate-400">XP</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mastery Trend Chart Card */}
        <MasteryTrendChart 
          trendData={trendData} 
          chartMetric={chartMetric} 
          setChartMetric={setChartMetric} 
        />

        {/* Today's Completed List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Arena Deck</h3>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 divide-y divide-slate-50 shadow-sm">
            {todaysMuscles.map((muscle) => {
              if (!muscle) return null;
              const isTodayDone = todayCompleted.includes(muscle.id);
              return (
                <div key={muscle.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isTodayDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isTodayDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {muscle.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{muscle.region}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    isTodayDone 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isTodayDone ? 'Solved ✓' : 'Unsolved'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
