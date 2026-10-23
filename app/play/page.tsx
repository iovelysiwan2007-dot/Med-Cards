'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Puzzle, Trophy, Flame, ChevronRight, HelpCircle, 
  ArrowLeft, CheckCircle2, AlertTriangle, RefreshCcw, 
  Sparkles, Star, Lightbulb, Play, BookOpen 
} from 'lucide-react';
import { usePhysio } from '../../context/PhysioContext';
import { muscles, TODAYS_MUSCLE_IDS, Muscle } from '../../data/muscles';
import { getLevelInfo } from '../../lib/utils';
import Navigation from '../../components/Navigation';

// Define the OIAN category keys and labels
interface Category {
  id: 'origin' | 'insertion' | 'action' | 'nerveSupply';
  label: string;
  placeholder: string;
}

const CATEGORIES: Category[] = [
  { id: 'origin', label: 'ORIGIN', placeholder: 'Tap or drop correct origin here' },
  { id: 'insertion', label: 'INSERTION', placeholder: 'Tap or drop correct insertion here' },
  { id: 'action', label: 'ACTION', placeholder: 'Tap or drop correct action here' },
  { id: 'nerveSupply', label: 'NERVE SUPPLY', placeholder: 'Tap or drop correct nerve supply here' },
];

export default function PlayPuzzlePage() {
  const { todayCompleted, streak, xp, completeMusclePuzzle, addXp, isLoading } = usePhysio();

  // Get today's muscles in correct order
  const todaysMuscles = TODAYS_MUSCLE_IDS.map(id => muscles.find(m => m.id === id)).filter(Boolean) as Muscle[];

  // Game flow states
  const [currentMuscleIdx, setCurrentMuscleIdx] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'muscle_solved' | 'all_complete'>('playing');
  
  // Active game states for the current muscle
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [solvedCategories, setSolvedCategories] = useState<Record<string, boolean>>({});
  
  // Initialize shuffled tiles for the first muscle without useEffect
  const [shuffledTiles, setShuffledTiles] = useState<string[]>(() => {
    const firstMuscle = todaysMuscles[0];
    if (!firstMuscle) return [];
    return [
      firstMuscle.origin,
      firstMuscle.insertion,
      firstMuscle.action,
      firstMuscle.nerveSupply,
    ].sort(() => 0.5 - Math.random());
  });

  const [muscleMistakes, setMuscleMistakes] = useState(0);
  const [totalSessionMistakes, setTotalSessionMistakes] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null); // To trigger CSS shaking animations
  const [showHint, setShowHint] = useState(false);
  const [xpPopups, setXpPopups] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [popupCounter, setPopupCounter] = useState(0);

  // Track session XP separately to display on results
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCompletedIds, setSessionCompletedIds] = useState<string[]>([]);

  // Get current active muscle
  const currentMuscle = todaysMuscles[currentMuscleIdx];

  // Handle tap-to-select matching
  const handleSelectTile = (tileValue: string) => {
    // If the tile is already matched, ignore
    const isAlreadyMatched = Object.keys(solvedCategories).some(
      (catKey) => solvedCategories[catKey] && currentMuscle[catKey as keyof Muscle] === tileValue
    );
    if (isAlreadyMatched) return;

    setSelectedTile(tileValue);
  };

  const handleSelectCategory = (catId: 'origin' | 'insertion' | 'action' | 'nerveSupply', e?: React.MouseEvent) => {
    if (!selectedTile) return;
    if (solvedCategories[catId]) return; // Already solved

    const correctValue = currentMuscle[catId];

    if (selectedTile === correctValue) {
      // CORRECT!
      const nextSolved = { ...solvedCategories, [catId]: true };
      setSolvedCategories(nextSolved);

      // Remove the matched tile from list
      setShuffledTiles(prev => prev.filter(t => t !== selectedTile));
      setSelectedTile(null);

      // Create a floating XP popup at click position if event exists, else center
      const posX = e ? e.clientX : 200;
      const posY = e ? e.clientY : 300;
      const popupId = popupCounter;
      setPopupCounter(prev => prev + 1);

      setXpPopups(prev => [...prev, { id: popupId, text: '+10 XP', x: posX, y: posY }]);
      setSessionXp(prev => prev + 10);
      
      // Remove popup after animation
      setTimeout(() => {
        setXpPopups(prev => prev.filter(p => p.id !== popupId));
      }, 1000);

      // Check if this muscle puzzle is fully complete
      const isNowSolved = Object.keys(nextSolved).length === 4;
      if (isNowSolved) {
        // Complete muscle gives extra XP
        const muscleAccuracy = Math.max(0, Math.round((4 / (4 + muscleMistakes)) * 100));
        const earnedMuscleXp = 25; // Complete muscle XP
        const earnedTotal = 40 + earnedMuscleXp; // (4 * 10) + 25 = 65

        setTimeout(() => {
          // Trigger solved screen
          setGameState('muscle_solved');
          setSessionXp(prevXp => prevXp + earnedMuscleXp);
          if (!sessionCompletedIds.includes(currentMuscle.id)) {
            setSessionCompletedIds(prev => [...prev, currentMuscle.id]);
          }
          // Save inside context
          completeMusclePuzzle(currentMuscle.id, muscleAccuracy, earnedTotal);
        }, 100);
      }

    } else {
      // WRONG!
      setMuscleMistakes(prev => prev + 1);
      setTotalSessionMistakes(prev => prev + 1);
      setShakeId(catId);
      setSelectedTile(null);

      // Clear shake effect
      setTimeout(() => {
        setShakeId(null);
      }, 500);
    }
  };

  // Support HTML5 drag-and-drop
  const handleDragStart = (e: React.DragEvent, tileValue: string) => {
    e.dataTransfer.setData('text/plain', tileValue);
    setSelectedTile(tileValue);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, catId: 'origin' | 'insertion' | 'action' | 'nerveSupply') => {
    e.preventDefault();
    const tileValue = e.dataTransfer.getData('text/plain');
    if (tileValue) {
      setSelectedTile(tileValue);
      // Execute match
      setTimeout(() => {
        handleSelectCategory(catId);
      }, 0);
    }
  };

  // Skip / Hint triggers
  const triggerHint = () => {
    setShowHint(true);
  };

  // Move to next muscle or wrap up
  const handleNextMuscle = () => {
    if (currentMuscleIdx < todaysMuscles.length - 1) {
      const nextIdx = currentMuscleIdx + 1;
      const nextMuscle = todaysMuscles[nextIdx];
      setCurrentMuscleIdx(nextIdx);
      
      // Reset muscle-specific states for the next muscle
      setSolvedCategories({});
      setSelectedTile(null);
      setMuscleMistakes(0);
      setShowHint(false);
      
      const values = [
        nextMuscle.origin,
        nextMuscle.insertion,
        nextMuscle.action,
        nextMuscle.nerveSupply,
      ];
      setShuffledTiles([...values].sort(() => 0.5 - Math.random()));
      
      setGameState('playing');
    } else {
      // Finished all 5 muscles!
      // Add final 50 bonus XP
      addXp(50);
      setSessionXp(prev => prev + 50);
      setGameState('all_complete');
    }
  };

  // Restarts the entire deck for a fresh revision
  const handleRestartQuiz = () => {
    setCurrentMuscleIdx(0);
    const firstMuscle = todaysMuscles[0];
    if (firstMuscle) {
      const values = [
        firstMuscle.origin,
        firstMuscle.insertion,
        firstMuscle.action,
        firstMuscle.nerveSupply,
      ];
      setShuffledTiles([...values].sort(() => 0.5 - Math.random()));
    }
    setSolvedCategories({});
    setSelectedTile(null);
    setMuscleMistakes(0);
    setShowHint(false);
    setGameState('playing');
    setTotalSessionMistakes(0);
    setSessionXp(0);
    setSessionCompletedIds([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Puzzle className="h-10 w-10 text-blue-600 animate-pulse" />
          <p className="text-sm font-semibold text-slate-500 tracking-wider">Loading Anatomy Puzzle...</p>
        </div>
      </div>
    );
  }

  // Level Info
  const levelInfo = getLevelInfo(xp);

  // Overall accuracy
  const overallAccuracy = Math.max(
    10, 
    Math.round(((todaysMuscles.length * 4) / (todaysMuscles.length * 4 + totalSessionMistakes)) * 100)
  );

  return (
    <div className="h-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-900 pb-4 font-sans selection:bg-blue-100 relative w-full flex flex-col">
      
      {/* Floating XP Popups */}
      <AnimatePresence>
        {xpPopups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: popup.y, x: popup.x, scale: 0.8 }}
            animate={{ opacity: 0, y: popup.y - 120, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed pointer-events-none z-50 text-emerald-500 font-black text-xl tracking-wide flex items-center gap-1 drop-shadow-md bg-white px-3 py-1.5 rounded-full border border-emerald-100"
          >
            <Sparkles className="h-4 w-4 fill-emerald-400 text-emerald-500" />
            {popup.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header bar */}
      <header className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-5 w-px bg-slate-100" />
          <div className="flex items-center gap-1">
            <Puzzle className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-black tracking-wider text-slate-500 uppercase">Anatomy Arena</span>
          </div>
        </div>

        {/* Level & Current Session XP info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-700">{streak}d</span>
          </div>
          <div className="text-right text-xs font-bold text-slate-400">
            <span className="text-blue-600">{xp}</span> total XP
          </div>
        </div>
      </header>

      {/* Progress tracking indicator */}
      {gameState !== 'all_complete' && (
        <div className="w-full px-4 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-bold">
            <span>CHALLENGE {currentMuscleIdx + 1} OF 5</span>
            <span className="text-blue-600">Accuracy: {overallAccuracy}%</span>
          </div>
          <div className="flex gap-1">
            {todaysMuscles.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  idx < currentMuscleIdx 
                    ? 'bg-emerald-500' 
                    : idx === currentMuscleIdx && gameState === 'playing'
                    ? 'bg-blue-600'
                    : idx === currentMuscleIdx && gameState === 'muscle_solved'
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Playing state layout */}
      {gameState === 'playing' && currentMuscle && (
        <main className="w-full px-4 pt-4 space-y-5">
          
          {/* Target anatomy display */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-1.5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-blue-600 w-full" />
            <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Anatomy Build</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{currentMuscle.name}</h2>
            <p className="text-xs font-semibold text-slate-400 italic">
              &ldquo;{currentMuscle.description}&rdquo;
            </p>
          </div>

          <div className="text-xs text-center font-bold text-slate-400">
            Match the four slots below by tapping a tile first, then clicking its slot!
          </div>

          {/* OIAN Slots Grid */}
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const isSolved = solvedCategories[cat.id];
              const value = currentMuscle[cat.id];
              const isShaking = shakeId === cat.id;

              return (
                <div 
                  key={cat.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  onClick={(e) => handleSelectCategory(cat.id, e)}
                  className={`border rounded-2xl p-4 transition-all duration-200 relative cursor-pointer ${
                    isSolved 
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 shadow-xs' 
                      : selectedTile 
                      ? 'hover:border-blue-400 hover:bg-blue-50/30 border-blue-100 bg-white' 
                      : 'border-slate-100 bg-white'
                  } ${isShaking ? 'animate-shake border-rose-300 bg-rose-50/30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-black tracking-wider ${isSolved ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {cat.label}
                    </span>
                    {isSolved && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        ✓ Correct +10 XP
                      </span>
                    )}
                  </div>

                  <div className={`text-sm leading-relaxed ${isSolved ? 'font-bold text-slate-800' : 'text-slate-400 font-medium italic'}`}>
                    {isSolved ? value : cat.placeholder}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Draggable and Tappable Puzzle Pieces */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">Available Tiles</span>
              <button 
                onClick={triggerHint}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100/60 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Need Hint?</span>
              </button>
            </div>

            {showHint && (
              <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-xl text-xs text-amber-800 leading-relaxed">
                <strong>Anatomical Hint:</strong> {currentMuscle.clinicalRelevance.split('.')[0]}.
                <p className="mt-1 opacity-90">Nerve supply is {currentMuscle.nerveSupply}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {shuffledTiles.map((tile, index) => {
                const isSelected = selectedTile === tile;

                return (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tile)}
                    onClick={() => handleSelectTile(tile)}
                    className={`p-4 rounded-xl border text-xs font-semibold text-slate-700 leading-relaxed shadow-xs cursor-pointer select-none transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-99 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 text-blue-800 scale-[1.02] ring-2 ring-blue-500/20' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 text-[10px] font-mono select-none">::</span>
                      <span>{tile}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* State 2: Muscle solved confirmation */}
      {gameState === 'muscle_solved' && currentMuscle && (
        <main className="w-full px-4 pt-12 text-center space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <span className="block text-xs font-black tracking-widest text-emerald-600 uppercase">🎉 CHALLENGE SOLVED!</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{currentMuscle.name}</h2>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 max-w-sm mx-auto">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <span className="text-sm font-semibold text-slate-400">XP Earned</span>
              <span className="text-base font-black text-emerald-600 flex items-center gap-1">
                <Sparkles className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                +65 XP
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-400">Accuracy</span>
              <span className="text-base font-black text-slate-700">
                {Math.max(10, Math.round((4 / (4 + muscleMistakes)) * 100))}%
              </span>
            </div>
          </div>

          <button
            onClick={handleNextMuscle}
            className="inline-flex items-center justify-center w-full max-w-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold py-4 px-4 rounded-2xl shadow-md hover:from-blue-700 hover:to-blue-800 active:scale-98 transition-all duration-200 text-sm tracking-wide"
          >
            <span>{currentMuscleIdx === todaysMuscles.length - 1 ? "FINISH DAILY CHALLENGE →" : "NEXT MUSCLE PUZZLE →"}</span>
          </button>
        </main>
      )}

      {/* State 3: Daily puzzle complete & Results Screen */}
      {gameState === 'all_complete' && (
        <main className="w-full px-4 pt-10 text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-2 animate-bounce">
              <Trophy className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Daily Challenge Complete!</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest text-blue-600">5 / 5 Muscles Solved</p>
          </div>

          {/* Results Summary Grid */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm divide-y divide-slate-50 text-left max-w-sm mx-auto space-y-4">
            
            <div className="grid grid-cols-2 gap-4 pb-4">
              <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100/50">
                <span className="block text-2xl font-black text-blue-600 flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-blue-500 text-blue-500" />
                  +{sessionXp}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP Earned</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100/50">
                <span className="block text-2xl font-black text-emerald-600">{overallAccuracy}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Accuracy</span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Today&apos;s Mastered Muscles</h4>
              <div className="space-y-2">
                {todaysMuscles.map((muscle) => (
                  <div key={muscle.id} className="flex items-center justify-between text-sm bg-slate-50/50 px-3 py-2.5 rounded-xl border border-slate-100/30">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="font-bold text-slate-700">{muscle.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{muscle.region}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 max-w-sm mx-auto">
            <Link
              href="/library"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold py-4 px-4 rounded-2xl shadow-md hover:from-blue-700 hover:to-blue-800 active:scale-98 transition-all duration-200 text-sm tracking-wide"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span>REVIEW TODAY&apos;S MUSCLES</span>
            </Link>

            <button
              onClick={handleRestartQuiz}
              className="inline-flex items-center justify-center w-full bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-2xl hover:bg-slate-200 active:scale-98 transition-all duration-200 text-sm tracking-wide"
            >
              <RefreshCcw className="h-3.5 w-3.5 mr-2" />
              <span>REPLAY REVISION PUZZLE</span>
            </button>
          </div>
        </main>
      )}

      {/* Global Navigation */}
      <Navigation />
    </div>
  );
}
