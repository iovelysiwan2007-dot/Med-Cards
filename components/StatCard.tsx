'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  id?: string;
}

export default function StatCard({ label, value, icon: Icon, iconColor = 'text-blue-500', id }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3.5" id={id}>
      <div className={`p-2.5 rounded-lg bg-slate-50 ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{label}</p>
        <p className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}
