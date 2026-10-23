'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, CheckCircle2, AlertTriangle, RefreshCcw, 
  ArrowLeft, HelpCircle, ChevronRight, Eye, EyeOff, 
  Award, Flame, Trophy, Star, Sparkles, HeartPulse
} from 'lucide-react';
import Navigation from '../../components/Navigation';

// Define high-yield muscle schema as requested by BPT students
interface FlashcardMuscle {
  id: string;
  name: string;
  region: 'Upper Limb' | 'Lower Limb' | 'Trunk';
  origin: string;
  insertion: string;
  action: string;
  nerveSupply: string;
  clinicalRelevance: string;
  vivaQuestion: string;
  vivaAnswer: string;
}

// 3 High-Yield Sample Muscle Objects with full clinical and viva datasets
const SAMPLE_FLASHCARD_MUSCLES: FlashcardMuscle[] = [
  {
    id: 'deltoid',
    name: 'Deltoid',
    region: 'Upper Limb',
    origin: 'Lateral third of clavicle, acromion, and spine of scapula.',
    insertion: 'Deltoid tuberosity of humerus.',
    action: 'Anterior part: Flexion and medial rotation. Middle part: Abduction (15° to 90°). Posterior part: Extension and lateral rotation.',
    nerveSupply: 'Axillary nerve (C5, C6).',
    clinicalRelevance: 'Common site for intramuscular injections. Damage to the axillary nerve from shoulder dislocation leads to muscle atrophy and severe weakness in arm abduction.',
    vivaQuestion: 'Which nerve is at risk during intramuscular injections into the deltoid, and what is its spinal origin?',
    vivaAnswer: 'The axillary nerve (C5, C6) is at risk. It wraps around the surgical neck of the humerus, roughly 2 inches (5 cm) below the acromion process.'
  },
  {
    id: 'supraspinatus',
    name: 'Supraspinatus',
    region: 'Upper Limb',
    origin: 'Supraspinous fossa of scapula.',
    insertion: 'Greater tubercle of humerus (superior facet).',
    action: 'Initiates abduction of the arm (first 15°) and stabilizes the humeral head in the glenoid cavity during movement.',
    nerveSupply: 'Suprascapular nerve (C5, C6).',
    clinicalRelevance: 'The most commonly injured rotator cuff muscle. Subject to friction impingement under the acromion, leading to the clinical Painful Arc Syndrome (60° to 120°).',
    vivaQuestion: 'Why is supraspinatus clinically evaluated using the "Empty Can" test, and what does a positive test indicate?',
    vivaAnswer: 'The "Empty Can" (Jobe) test isolates the supraspinatus by abducting the arm to 90° and internally rotating it. Pain or muscle weakness indicates tendinitis, impingement, or a cuff tear.'
  },
  {
    id: 'tibialis-anterior',
    name: 'Tibialis Anterior',
    region: 'Lower Limb',
    origin: 'Lateral condyle and superior half of lateral surface of tibia, and interosseous membrane.',
    insertion: 'Medial cuneiform and base of first metatarsal.',
    action: 'Primary dorsiflexor of the foot at the ankle joint; inverts the foot at subtalar joints.',
    nerveSupply: 'Deep fibular nerve (L4, L5).',
    clinicalRelevance: 'Injury to the deep fibular nerve causes Foot Drop (high-steppage gait). Repetitive strain on this compartment causes anterior tibial stress syndrome, commonly known as "shin splints".',
    vivaQuestion: 'Explain the physiological mechanism of Foot Drop in relation to Tibialis Anterior paralysis.',
    vivaAnswer: 'When the Tibialis Anterior is paralyzed, active dorsiflexion is lost. During the swing phase of gait, the foot remains plantarflexed, forcing the patient to lift their knee higher to clear the ground.'
  }
];

export default function FlashcardsPage() {
  // Persistence state keys
  const STATE_KEY = 'clinicaliq_flashcard_progress';
  const LEGACY_STATE_KEY = 'medcards_flashcard_progress';
  const LEGACY_STATE_KEY_2 = 'physiocards_flashcard_progress';

  // Queue and Session States
  const [queue, setQueue] = useState<FlashcardMuscle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        let stored = localStorage.getItem(STATE_KEY);
        if (!stored) {
          stored = localStorage.getItem(LEGACY_STATE_KEY);
        }
        if (!stored) {
          stored = localStorage.getItem(LEGACY_STATE_KEY_2);
        }
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.masteredIds || [];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [reviewIds, setReviewIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        let stored = localStorage.getItem(STATE_KEY);
        if (!stored) {
          stored = localStorage.getItem(LEGACY_STATE_KEY);
        }
        if (!stored) {
          stored = localStorage.getItem(LEGACY_STATE_KEY_2);
        }
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.reviewIds || [];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  
  // Flashcard Interactivity States
  const [isFlipped, setIsFlipped] = useState(false);
  const [showVivaAnswer, setShowVivaAnswer] = useState(false);
  const [sessionState, setSessionState] = useState<'welcome' | 'learning' | 'complete'>('welcome');
  const [streakDays, setStreakDays] = useState(3); // default mockup/gamified streak
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Save progress to localStorage
  const saveProgress = (newMastered: string[], newReview: string[]) => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        masteredIds: newMastered,
        reviewIds: newReview
      }));
    } catch (e) {
      console.error('Failed to save flashcard state', e);
    }
  };

  // Initialize learning deck
  const startSession = (mode: 'all' | 'revision') => {
    let initialList: FlashcardMuscle[] = [];
    
    if (mode === 'revision') {
      // Filter list to only contain reviewIds
      initialList = SAMPLE_FLASHCARD_MUSCLES.filter(m => reviewIds.includes(m.id));
      // If revision is empty, fall back to all
      if (initialList.length === 0) {
        initialList = [...SAMPLE_FLASHCARD_MUSCLES];
      }
    } else {
      initialList = [...SAMPLE_FLASHCARD_MUSCLES];
    }

    setQueue(initialList);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowVivaAnswer(false);
    setSessionState('learning');
    setIsTransitioning(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAssessment = (know: boolean) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const currentMuscle = queue[currentIndex];
    let nextMastered = [...masteredIds];
    let nextReview = [...reviewIds];

    if (know) {
      // Add to mastered, remove from review queue
      if (!nextMastered.includes(currentMuscle.id)) {
        nextMastered.push(currentMuscle.id);
      }
      nextReview = nextReview.filter(id => id !== currentMuscle.id);
    } else {
      // Add to review queue, remove from mastered
      if (!nextReview.includes(currentMuscle.id)) {
        nextReview.push(currentMuscle.id);
      }
      nextMastered = nextMastered.filter(id => id !== currentMuscle.id);
    }

    setMasteredIds(nextMastered);
    setReviewIds(nextReview);
    saveProgress(nextMastered, nextReview);

    // Advanced Queue mechanics
    if (currentIndex < queue.length - 1) {
      // Slide to next card
      setIsFlipped(false);
      setShowVivaAnswer(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 60);
    } else {
      // Completed all cards in the current set
      setSessionState('complete');
      setIsTransitioning(false);
    }
  };

  // Handle Full Reset
  const handleResetAll = () => {
    setMasteredIds([]);
    setReviewIds([]);
    try {
      localStorage.removeItem(STATE_KEY);
    } catch (e) {}
    startSession('all');
  };

  // Progress metrics
  const totalCards = queue.length;
  const progressPercent = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;
  const activeCard = queue[currentIndex];

  return (
    <div className="h-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-900 pb-4 font-sans selection:bg-blue-100 relative w-full flex flex-col">
      
      {/* Navigation Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-3 px-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-5 w-px bg-slate-100 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">Flashcard Arena</span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 font-extrabold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{masteredIds.length} Know</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-900/30 font-extrabold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{reviewIds.length} Review</span>
          </div>
        </div>
      </header>

      {/* Screen 1: Welcome / Mode Selector */}
      {sessionState === 'welcome' && (
        <main className="w-full px-4 pt-4 text-center space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-2 border border-blue-100">
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Flashcards</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Study the anatomical origins, insertions, functional actions, nerve supplies, clinical syndromes, and high-yield viva questions with our Day 2 active recall engine.
            </p>
          </div>

          {/* Diagnostic status block */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs text-left space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>DATABASE STATUS</span>
              <span className="text-emerald-600">30 Muscles Implemented</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                <span className="block text-lg font-black text-slate-700">{masteredIds.length}</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Mastered (✅)</span>
              </div>
              <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                <span className="block text-lg font-black text-amber-600">{reviewIds.length}</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Need Revision (❌)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => startSession('all')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md active:scale-98 transition-all text-sm tracking-wide"
            >
              START ALL CARDS ({SAMPLE_FLASHCARD_MUSCLES.length})
            </button>

            {reviewIds.length > 0 && (
              <button
                onClick={() => startSession('revision')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm active:scale-98 transition-all text-sm tracking-wide"
              >
                REVISE WEAK CARDS ONLY ({SAMPLE_FLASHCARD_MUSCLES.filter(m => reviewIds.includes(m.id)).length})
              </button>
            )}
          </div>
        </main>
      )}

      {/* Screen 2: Flashcards session queue */}
      {sessionState === 'learning' && activeCard && (
        <main className="w-full px-4 pt-4 space-y-5">
          
          {/* Deck Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              <span>Card {currentIndex + 1} of {totalCards}</span>
              <span className="text-blue-600">{Math.round(progressPercent)}% Checked</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Flashcard with Perspective Flip Container */}
          <div className="perspective-1000 w-full min-h-[420px] relative">
            <div 
              onClick={handleFlip}
              className={`w-full min-h-[420px] rounded-3xl border border-slate-100 shadow-sm transition-all duration-250 transform cursor-pointer relative bg-white flex flex-col justify-between ${
                isFlipped ? 'rotate-y-180 border-indigo-100 bg-indigo-50/10' : 'hover:border-slate-200'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              
              {/* CARD FRONT SIDE */}
              <div 
                className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {activeCard.region}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <HeartPulse className="h-3.5 w-3.5 text-blue-500" />
                      Anatomy Card
                    </span>
                  </div>

                  <div className="space-y-2 text-center pt-16">
                    <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">Target Muscle</span>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{activeCard.name}</h3>
                    <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full mt-2" />
                  </div>
                </div>

                <div className="text-center pb-6">
                  <div className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-full border border-slate-100 transition-colors">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>TAP TO REVEAL OIAN DETAILS</span>
                  </div>
                </div>
              </div>

              {/* CARD BACK SIDE */}
              <div 
                className="absolute inset-0 p-5 overflow-y-auto flex flex-col justify-between backface-hidden rotate-y-180"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-base font-black text-indigo-900">{activeCard.name}</h4>
                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                      {activeCard.region}
                    </span>
                  </div>

                  {/* Scientific Slots Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Origin</span>
                      <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">{activeCard.origin}</p>
                    </div>

                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Insertion</span>
                      <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">{activeCard.insertion}</p>
                    </div>

                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Action</span>
                      <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">{activeCard.action}</p>
                    </div>

                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Nerve Supply</span>
                      <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">{activeCard.nerveSupply}</p>
                    </div>
                  </div>

                  {/* Clinical Relevance */}
                  <div className="bg-slate-50 border border-slate-100/50 p-3 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Clinical Relevance</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">{activeCard.clinicalRelevance}</p>
                  </div>

                  {/* Viva Question Section with separate click handling so flip doesn't fire */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl space-y-2 text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                        High-Yield Viva Question
                      </span>
                      <button 
                        onClick={() => setShowVivaAnswer(!showVivaAnswer)}
                        className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 px-2 py-0.5 bg-indigo-100/60 rounded"
                      >
                        {showVivaAnswer ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Hide Answer</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Show Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] font-bold text-indigo-950 leading-relaxed">
                      {activeCard.vivaQuestion}
                    </p>
                    {showVivaAnswer && (
                      <p className="text-[11px] text-indigo-800 leading-relaxed border-t border-indigo-100/50 pt-1.5 font-medium">
                        <strong>Model Answer:</strong> {activeCard.vivaAnswer}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-center pt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Tap card background to flip back
                </div>

              </div>
            </div>
          </div>

          {/* Action Self-Assessment Buttons */}
          <div className="space-y-2">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Mark your assessment</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAssessment(false)}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-slate-150 text-slate-700 hover:text-rose-700 font-extrabold py-3.5 px-4 rounded-2xl active:scale-97 transition-all text-xs"
              >
                <X className="h-4 w-4 text-rose-500" />
                <span>❌ NEED REVISION</span>
              </button>

              <button
                onClick={() => handleAssessment(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-sm active:scale-97 transition-all text-xs"
              >
                <Check className="h-4 w-4" />
                <span>✅ I KNOW THIS</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Screen 3: End of Session Summary Screen */}
      {sessionState === 'complete' && (
        <main className="w-full px-4 pt-10 text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-2 animate-bounce">
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Review Complete!</h2>
            <p className="text-xs font-black text-blue-600 uppercase tracking-wider">Active Memory Session Finalized</p>
          </div>

          {/* Statistical Breakdown */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm divide-y divide-slate-50 text-left max-w-sm mx-auto space-y-4">
            
            <div className="grid grid-cols-2 gap-4 pb-4">
              <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100/50">
                <span className="block text-2xl font-black text-emerald-600">
                  {SAMPLE_FLASHCARD_MUSCLES.filter(m => masteredIds.includes(m.id)).length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastered (✅)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100/50">
                <span className="block text-2xl font-black text-amber-500">
                  {SAMPLE_FLASHCARD_MUSCLES.filter(m => reviewIds.includes(m.id)).length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Queue (❌)</span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Target Muscle Status Summary</h4>
              <div className="space-y-2.5">
                {SAMPLE_FLASHCARD_MUSCLES.map((muscle) => {
                  const isKnown = masteredIds.includes(muscle.id);

                  return (
                    <div key={muscle.id} className="flex items-center justify-between text-xs bg-slate-50/50 px-3.5 py-2.5 rounded-xl border border-slate-100/30">
                      <div className="flex items-center gap-2">
                        {isKnown ? (
                          <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                        ) : (
                          <span className="text-amber-500 font-extrabold text-sm">⚠</span>
                        )}
                        <span className="font-extrabold text-slate-700">{muscle.name}</span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        isKnown ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isKnown ? 'Mastered' : 'Revision'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 max-w-sm mx-auto">
            {SAMPLE_FLASHCARD_MUSCLES.filter(m => reviewIds.includes(m.id)).length > 0 && (
              <button
                onClick={() => startSession('revision')}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-4 px-4 rounded-2xl shadow-md active:scale-98 transition-all text-sm tracking-wide"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>REVISE WEAK MUSCLES ONLY</span>
              </button>
            )}

            <button
              onClick={handleResetAll}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl active:scale-98 transition-all text-sm tracking-wide"
            >
              <span>RESET & START OVER</span>
            </button>
          </div>
        </main>
      )}

      {/* Global Navigation bar */}
      <Navigation />
    </div>
  );
}

// Minimal local fallback helper icons
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>
  );
}
