'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Activity, ShieldAlert, Award, Footprints } from 'lucide-react';
import { usePhysio } from '../../../context/PhysioContext';
import { muscles, TODAYS_MUSCLE_IDS } from '../../../data/muscles';
import Navigation from '../../../components/Navigation';

export default function MuscleDetail() {
  const params = useParams();
  const router = useRouter();
  const { completedMuscles, markAsLearned, isLoading } = usePhysio();

  const id = params?.id as string;

  // Find the current muscle
  const muscleIndex = muscles.findIndex((m) => m.id === id);
  const muscle = muscles[muscleIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
      </div>
    );
  }

  if (!muscle) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <h3 className="text-lg font-bold text-slate-800">Muscle not found</h3>
        <p className="text-slate-500 text-sm mt-1">The requested anatomy card could not be found.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm">
          Go Home
        </Link>
      </div>
    );
  }

  const isCompleted = completedMuscles.includes(muscle.id);
  const isTodayMuscle = TODAYS_MUSCLE_IDS.includes(muscle.id);

  // Navigate to previous muscle
  const handlePrev = () => {
    const prevIndex = muscleIndex === 0 ? muscles.length - 1 : muscleIndex - 1;
    router.push(`/muscle/${muscles[prevIndex].id}`);
  };

  // Navigate to next muscle
  const handleNext = () => {
    const nextIndex = muscleIndex === muscles.length - 1 ? 0 : muscleIndex + 1;
    router.push(`/muscle/${muscles[nextIndex].id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Header with Back Action */}
      <header className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors py-1 pr-3"
            id="muscle-detail-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          {isTodayMuscle && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Today&apos;s Selection
            </span>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Title & Region */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
              {muscle.region}
            </span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight" id="detail-muscle-name">
              {muscle.name}
            </h2>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 font-bold text-xs px-2.5 py-1.5 rounded-full shrink-0">
              <CheckCircle2 className="h-4 w-4" />
              <span>Learned</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-500 leading-relaxed italic">
          &ldquo;{muscle.description}&rdquo;
        </p>

        {/* Learning Cards */}
        <div className="space-y-4" id="anatomical-details-cards">
          {/* Origin */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Origin</h4>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{muscle.origin}</p>
          </div>

          {/* Insertion */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Insertion</h4>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{muscle.insertion}</p>
          </div>

          {/* Action */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action</h4>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{muscle.action}</p>
          </div>

          {/* Nerve Supply */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nerve Supply</h4>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{muscle.nerveSupply}</p>
          </div>

          {/* Clinical Relevance */}
          <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest">Clinical Relevance</h4>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{muscle.clinicalRelevance}</p>
          </div>
        </div>

        {/* Mark as Learned Button */}
        <div className="pt-2">
          {isCompleted ? (
            <div className="flex items-center justify-center w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold py-4 px-4 rounded-xl text-center text-sm gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Completed ✓</span>
            </div>
          ) : (
            <button
              onClick={() => markAsLearned(muscle.id)}
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-md active:scale-[0.99] transition-all duration-200 text-sm"
              id="btn-mark-learned"
            >
              Mark as Learned
            </button>
          )}
        </div>

        {/* Navigation buttons: Previous & Next */}
        <div className="flex justify-between items-center gap-4 pt-4">
          <button
            onClick={handlePrev}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-100 hover:border-slate-200 py-3.5 px-4 rounded-xl text-slate-600 hover:text-slate-800 font-bold text-xs transition-colors shadow-xs"
            id="btn-prev-muscle"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-100 hover:border-slate-200 py-3.5 px-4 rounded-xl text-slate-600 hover:text-slate-800 font-bold text-xs transition-colors shadow-xs"
            id="btn-next-muscle"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
