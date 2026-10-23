'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface MasteryTrendChartProps {
  trendData: any[];
  chartMetric: 'gain' | 'cumulative';
  setChartMetric: (val: 'gain' | 'cumulative') => void;
}

export default function MasteryTrendChart({ trendData, chartMetric, setChartMetric }: MasteryTrendChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 w-full bg-slate-50/50 animate-pulse rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Loading Trend Data Visualization...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 uppercase">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span>Mastery Trend & Weekly Activity</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Anatomy learning speed vs. XP accumulation
          </p>
        </div>

        {/* Metric Toggle Buttons */}
        <div className="flex items-center bg-slate-50 border border-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setChartMetric('gain')}
            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              chartMetric === 'gain'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            DAILY XP
          </button>
          <button
            onClick={() => setChartMetric('cumulative')}
            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              chartMetric === 'cumulative'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            TOTAL XP
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: -5, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="day" 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            
            {/* Primary Y-Axis for XP */}
            <YAxis 
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6366f1', fontSize: 10, fontWeight: 700 }}
            />
            
            {/* Secondary Y-Axis for Mastery Percentage */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#0ea5e9', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `${value}%`}
            />
            
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.04)',
                padding: '10px'
              }}
              labelStyle={{ fontSize: '11px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
              itemStyle={{ fontSize: '11px', fontWeight: 700 }}
            />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontWeight: 700 }}
            />

            {/* Area representing XP Gain or Cumulative XP */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={chartMetric === 'gain' ? 'XP Gain' : 'Cumulative XP'}
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorXp)"
              name={chartMetric === 'gain' ? 'XP Gain (Points)' : 'Cumulative XP (Points)'}
            />

            {/* Line representing Mastery Rate */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Mastery Rate (%)"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, stroke: '#ffffff', fill: '#0ea5e9' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Anatomy Mastery Rate (%)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-50 flex items-start gap-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
        <span className="text-amber-500 text-xs">💡</span>
        <span>
          Your **Anatomy Mastery Rate** is calculated based on the 30 core muscles you study. Practice daily deck flashcards and tackle the Clinical cases to unlock 100% precision.
        </span>
      </div>
    </div>
  );
}
