'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
}

export default function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(0, value), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Goal</span>
        <span className="text-sm font-bold text-blue-600">{Math.round(clampedValue)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          id="progress-bar-fill"
        />
      </div>
    </div>
  );
}
