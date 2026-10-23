'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#0B132B] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl space-y-6">
        
        {/* Animated Compass Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-3xl bg-teal-500/10 text-teal-400 border border-teal-500/20 animate-pulse">
            <Compass className="h-12 w-12" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            404 - Lost in Anatomy
          </h1>
          <p className="text-sm font-semibold text-slate-400 leading-relaxed">
            The medical article or study card you are looking for has been moved or doesn&apos;t exist. Let&apos;s get you back on track!
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 group transition-all cursor-pointer"
          >
            <Home className="h-4.5 w-4.5" />
            <span>Go Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
