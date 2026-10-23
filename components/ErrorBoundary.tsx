'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCw, Layers } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ClinicalIQ ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
          <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-lg text-center space-y-6">
            {/* Branding Icon */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">ClinicalIQ</span>
              </div>
              <div className="h-0.5 w-12 bg-teal-500/30 rounded-full mt-1" />
            </div>

            {/* Error Graphic */}
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-10 w-10 animate-pulse" />
              </div>
            </div>

            {/* Text Copy */}
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                Something went wrong
              </h2>
              <p className="text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                We couldn&apos;t connect to ClinicalIQ servers. Please check your network or refresh.
              </p>
            </div>

            {/* Dev details if present */}
            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400 dark:text-slate-500 text-left max-h-24 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            {/* Reload CTA Button */}
            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-7 rounded-2xl bg-teal-600 dark:bg-teal-500 text-white font-extrabold text-sm tracking-wide shadow-md hover:bg-teal-500 dark:hover:bg-teal-400 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              id="btn-error-reload"
            >
              <RotateCw className="h-4 w-4" />
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
