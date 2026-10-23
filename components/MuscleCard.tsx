'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Award, Trophy } from 'lucide-react';
import { Muscle } from '../data/muscles';
import { usePhysio } from '../context/PhysioContext';

interface MuscleCardProps {
  muscle: Muscle;
  isCompleted: boolean;
  id?: string;
}

export default function MuscleCard({ muscle, isCompleted, id }: MuscleCardProps) {
  const { muscleMastery } = usePhysio();
  const mastery = muscleMastery[muscle.id] || 0;

  return (
    <Link
      href={`/muscle/${muscle.id}`}
      className={`block p-4 rounded-xl border transition-all duration-200 active:scale-[0.98] ${
        isCompleted
          ? 'bg-slate-50/50 border-slate-100'
          : 'bg-white border-slate-100 hover:border-blue-100 shadow-sm'
      }`}
      id={id || `muscle-card-${muscle.id}`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className={`font-semibold tracking-tight ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {muscle.name}
              </h4>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                muscle.region === 'Upper Limb'
                  ? 'bg-blue-50 text-blue-600'
                  : muscle.region === 'Lower Limb'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {muscle.region}
              </span>
              
              {/* Mastery Indicator Badge */}
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                mastery === 100 
                  ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                  : mastery > 0 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'bg-slate-50 text-slate-400'
              }`}>
                {mastery === 100 ? (
                  <>
                    <Trophy className="h-2 w-2 text-amber-500 fill-amber-500" />
                    <span>Mastered 100%</span>
                  </>
                ) : (
                  <span>Mastery: {mastery}%</span>
                )}
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
              {muscle.description}
            </p>
          </div>
          
          <div className="flex items-center gap-1 shrink-0 self-center">
            {isCompleted ? (
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Learned</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-400 text-xs bg-slate-50 px-2.5 py-1 rounded-lg">
                <span>Study</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Micro-Progress bar for mastery inside card */}
        <div className="space-y-1">
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                mastery === 100 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
