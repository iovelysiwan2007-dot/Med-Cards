'use client';

import React from 'react';
import { Sun, Moon, Globe, Monitor } from 'lucide-react';
import { useTheme, useLanguage, Language, Theme } from '../context/ThemeLanguageContext';
import { motion } from 'motion/react';

interface ThemeLangSelectorProps {
  className?: string;
  showLanguageOnly?: boolean;
  showThemeOnly?: boolean;
}

export default function ThemeLangSelector({ 
  className = '', 
  showLanguageOnly = false, 
  showThemeOnly = false 
}: ThemeLangSelectorProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const themeOptions: { value: Theme; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const langOptions: { value: Language; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'hinglish', label: 'Hinglish', flag: '🗣️' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Theme Selection */}
      {!showLanguageOnly && (
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-300">
          <div className="flex items-center gap-1.5 mb-2">
            <Sun className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {t('theme') || 'Theme Mode'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={`relative py-2.5 px-2 rounded-xl text-xs font-bold tracking-wide flex flex-col items-center justify-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-teal-400 border-teal-500/30 shadow-md scale-[1.02]'
                      : 'bg-transparent text-slate-400 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                  id={`theme-select-${opt.value}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="font-extrabold">{opt.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="activeThemeIndicator"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-teal-400"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Language Selection */}
      {!showThemeOnly && (
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-300">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {t('language') || 'Language / भाषा'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {langOptions.map((opt) => {
              const isSelected = language === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLanguage(opt.value)}
                  className={`relative py-2.5 px-2 rounded-xl text-xs font-bold tracking-wide flex flex-col items-center justify-center gap-1 transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-teal-400 border-teal-500/30 shadow-md scale-[1.02]'
                      : 'bg-transparent text-slate-400 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                  id={`lang-select-${opt.value}`}
                >
                  <span className="text-lg">{opt.flag}</span>
                  <span className="font-extrabold">{opt.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="activeLangIndicator"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-teal-400"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
