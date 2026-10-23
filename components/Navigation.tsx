'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Puzzle, Layers, Flame } from 'lucide-react';
import { useLanguage } from '../context/ThemeLanguageContext';

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      label: t('dashboard') || 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      label: t('anatomy') || 'Anatomy',
      href: '/anatomy',
      icon: BookOpen,
    },
    {
      label: t('playQuiz') || 'Play Quiz',
      href: '/play',
      icon: Puzzle,
    },
    {
      label: t('flashcards') || 'Flashcards',
      href: '/flashcards',
      icon: Layers,
    },
    {
      label: t('streak') || 'Streak',
      href: '/progress',
      icon: Flame,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 z-50 px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom,0px))] shadow-2xl transition-colors duration-300 h-[68px] sm:h-[72px] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto flex justify-between items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation ${
                isActive
                  ? 'text-teal-400 scale-105 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className={`h-5 w-5 mb-0.5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight font-medium font-sans text-center truncate w-full">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
