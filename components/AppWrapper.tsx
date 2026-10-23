'use client';

import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { usePhysio } from '../context/PhysioContext';
import { useLanguage } from '../context/ThemeLanguageContext';
import { Layers, Activity, WifiOff, RefreshCw } from 'lucide-react';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading: contextLoading } = usePhysio();
  const { t } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutActive, setTimeoutActive] = useState(false);

  useEffect(() => {
    // 5-second Safety Timeout
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("[ClinicalIQ] 5-second Safety Timeout triggered.");
        setTimeoutActive(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    // When context finishes loading, we also resolve our wrapper loading
    if (!contextLoading) {
      setIsLoading(false);
    }
  }, [contextLoading]);

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleProceedOffline = () => {
    setIsLoading(false);
    setTimeoutActive(false);
  };

  // If we are still loading AND the timeout has been reached, display the friendly Error/Retry UI
  if (isLoading && timeoutActive) {
    return (
      <div className="w-full min-h-[100dvh] flex items-center justify-center p-4 bg-slate-950 transition-colors duration-300 font-sans">
        <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          {/* Branding Icon */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <Layers className="h-5 w-5 text-teal-400 animate-pulse" />
              <span className="text-xl font-black text-slate-100 tracking-tight">ClinicalIQ</span>
            </div>
            <div className="h-0.5 w-12 bg-teal-500/30 rounded-full mt-1" />
          </div>

          {/* Connection Error Graphic */}
          <div className="flex justify-center">
            <div className="p-3.5 rounded-xl bg-amber-950/20 text-amber-400 border border-amber-900/30">
              <WifiOff className="h-8 w-8 animate-bounce" />
            </div>
          </div>

          {/* Text Copy */}
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-slate-100">
              Connection slow or offline
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
              We are having trouble reaching the ClinicalIQ servers. You can proceed offline with your saved data or try again.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleProceedOffline}
              className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm tracking-wide shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              id="btn-timeout-proceed"
            >
              Proceed Offline
            </button>
            <button
              onClick={handleRetry}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs tracking-wide hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-timeout-retry"
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular Loading State Spinner
  if (isLoading) {
    return (
      <div className="w-full min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="flex flex-col items-center gap-3 text-center">
          <Activity className="h-9 w-9 text-teal-400 animate-pulse" />
          <p className="text-sm font-semibold text-slate-300 tracking-wider">
            {t('loading') || 'Loading ClinicalIQ...'}
          </p>
          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            Connecting Securely
          </span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans antialiased box-border pt-[env(safe-area-inset-top,0px)] pb-[calc(72px+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>
    </ErrorBoundary>
  );
}
