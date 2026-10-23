'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, Filter, CheckCircle2, Bookmark, BookmarkCheck, Heart, 
  ChevronRight, ChevronLeft, Info, Trophy, Play, RefreshCw, Layers, 
  Activity, Brain, Wind, HeartHandshake, Shield, Zap, Scissors, 
  Sparkles, User, Footprints, Compass, Star, GraduationCap, AlertCircle, 
  HelpCircle, Eye, EyeOff, RotateCcw, Check, ListChecks
} from 'lucide-react';
import { usePhysio } from '../../context/PhysioContext';
import { allMuscles, anatomyRegions, getMuscleCountByRegion } from '../../data/anatomy/muscles';
import { MuscleAnatomy, MuscleRegionInfo } from '../../data/anatomy/types';
import Navigation from '../../components/Navigation';

// Helper to map region code to a Lucide icon
const getRegionIcon = (code: string) => {
  switch (code) {
    case 'HEAD': return Brain;
    case 'NECK': return Activity;
    case 'BACK': return Layers;
    case 'THORAX': return Heart;
    case 'ABDOMEN': return Wind;
    case 'SHOULDER': return Shield;
    case 'ARM': return Zap;
    case 'FOREARM': return Scissors;
    case 'HAND': return Sparkles;
    case 'PELVIS': return User;
    case 'THIGH': return Footprints;
    case 'LEG': return Compass;
    case 'FOOT': return Star;
    default: return Info;
  }
};

export default function MuscleAnatomyDashboard() {
  const router = useRouter();
  const { 
    xp, addXp, learnedAnatomy, favoriteAnatomy, toggleLearnedAnatomy, toggleFavoriteAnatomy 
  } = usePhysio();

  // Navigation State
  // 'regions' | 'list' | 'detail' | 'quiz' | 'flashcards'
  const [currentView, setCurrentView] = useState<'regions' | 'list' | 'detail' | 'quiz' | 'flashcards'>('regions');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [importanceFilter, setImportanceFilter] = useState<string>('all');
  const [learnedFilter, setLearnedFilter] = useState<string>('all'); // 'all', 'learned', 'unlearned'
  const [favoriteFilter, setFavoriteFilter] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);

  // Multi-Select Action State
  const [isBulkSelectionActive, setIsBulkSelectionActive] = useState(false);
  const [selectedMuscleIdsForBulk, setSelectedMuscleIdsForBulk] = useState<string[]>([]);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isQuizAnswerSubmitted, setIsQuizAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // Flashcard State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcardStats, setFlashcardStats] = useState<Record<string, 'easy' | 'medium' | 'hard'>>({});

  // Reset all search/filters on region change
  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSearchQuery('');
    setDifficultyFilter('all');
    setImportanceFilter('all');
    setLearnedFilter('all');
    setFavoriteFilter(false);
    setIsBulkSelectionActive(false);
    setSelectedMuscleIdsForBulk([]);
    setCurrentView('list');
  };

  // Filtered muscles based on selection, search, and filters
  const filteredMuscles = useMemo(() => {
    let list = allMuscles;

    if (selectedRegion && selectedRegion !== 'ALL') {
      list = list.filter(m => m.region === selectedRegion);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        m.muscleName.toLowerCase().includes(q) ||
        m.alternateName?.toLowerCase().includes(q) ||
        m.nerve.toLowerCase().includes(q) ||
        m.innervation.toLowerCase().includes(q) ||
        m.primaryAction.toLowerCase().includes(q) ||
        m.origin.toLowerCase().includes(q) ||
        m.insertion.toLowerCase().includes(q)
      );
    }

    if (difficultyFilter !== 'all') {
      list = list.filter(m => m.difficultyLevel === difficultyFilter);
    }

    if (importanceFilter !== 'all') {
      list = list.filter(m => m.examImportance === importanceFilter);
    }

    if (learnedFilter === 'learned') {
      list = list.filter(m => learnedAnatomy.includes(m.id));
    } else if (learnedFilter === 'unlearned') {
      list = list.filter(m => !learnedAnatomy.includes(m.id));
    }

    if (favoriteFilter) {
      list = list.filter(m => favoriteAnatomy.includes(m.id));
    }

    return list;
  }, [selectedRegion, searchQuery, difficultyFilter, importanceFilter, learnedFilter, favoriteFilter, learnedAnatomy, favoriteAnatomy]);

  // Selected Muscle for details
  const selectedMuscle = useMemo(() => {
    return allMuscles.find(m => m.id === selectedMuscleId) || null;
  }, [selectedMuscleId]);

  // Navigation index inside current list
  const currentMuscleIndexInFilteredList = useMemo(() => {
    if (!selectedMuscleId) return -1;
    return filteredMuscles.findIndex(m => m.id === selectedMuscleId);
  }, [selectedMuscleId, filteredMuscles]);

  const handleNextMuscle = () => {
    if (currentMuscleIndexInFilteredList < filteredMuscles.length - 1) {
      setSelectedMuscleId(filteredMuscles[currentMuscleIndexInFilteredList + 1].id);
    }
  };

  const handlePrevMuscle = () => {
    if (currentMuscleIndexInFilteredList > 0) {
      setSelectedMuscleId(filteredMuscles[currentMuscleIndexInFilteredList - 1].id);
    }
  };

  // BULK ACTIONS
  const handleToggleBulkSelect = (id: string) => {
    setSelectedMuscleIdsForBulk(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkMarkAsLearned = (learned: boolean) => {
    let count = 0;
    selectedMuscleIdsForBulk.forEach(id => {
      const isAlreadyLearned = learnedAnatomy.includes(id);
      if (learned && !isAlreadyLearned) {
        toggleLearnedAnatomy(id);
        count++;
      } else if (!learned && isAlreadyLearned) {
        toggleLearnedAnatomy(id);
      }
    });
    if (count > 0) {
      addXp(count * 15);
    }
    setSelectedMuscleIdsForBulk([]);
    setIsBulkSelectionActive(false);
  };

  const handleBulkToggleFavorite = () => {
    selectedMuscleIdsForBulk.forEach(id => {
      toggleFavoriteAnatomy(id);
    });
    setSelectedMuscleIdsForBulk([]);
    setIsBulkSelectionActive(false);
  };

  // QUIZ GENERATION MODULE
  const startQuiz = () => {
    const sourceMuscles = selectedRegion && selectedRegion !== 'ALL' 
      ? allMuscles.filter(m => m.region === selectedRegion) 
      : allMuscles;

    if (sourceMuscles.length < 3) {
      alert("Not enough muscles in this region to generate a full quiz. Try 'ALL' muscles!");
      return;
    }

    // Generate 5 distinct, high-quality MCQs
    const questionsList = [];
    const count = Math.min(5, sourceMuscles.length);
    const shuffledMuscles = [...sourceMuscles].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      const correctMuscle = shuffledMuscles[i];
      const distractors = sourceMuscles
        .filter(m => m.id !== correctMuscle.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // Distractors could be empty if region has too few muscles, pull from allMuscles if needed
      if (distractors.length < 3) {
        const fallbackDistractors = allMuscles
          .filter(m => m.id !== correctMuscle.id && !distractors.some(d => d.id === m.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 3 - distractors.length);
        distractors.push(...fallbackDistractors);
      }

      // Quiz question types: 
      // 0: "Which muscle has this action?"
      // 1: "What is the nerve supply of this muscle?"
      // 2: "Where is the origin of this muscle?"
      // 3: "Clinical vignette case query"
      const qType = Math.floor(Math.random() * 4);
      let questionText = '';
      let correctAnswerText = '';
      let wrongAnswersText: string[] = [];

      if (qType === 0) {
        questionText = `Which muscle is responsible for: "${correctMuscle.primaryAction}"?`;
        correctAnswerText = correctMuscle.muscleName;
        wrongAnswersText = distractors.map(d => d.muscleName);
      } else if (qType === 1) {
        questionText = `What is the nerve supply and root value of the "${correctMuscle.muscleName}" muscle?`;
        correctAnswerText = `${correctMuscle.nerve} (${correctMuscle.rootValue})`;
        wrongAnswersText = distractors.map(d => `${d.nerve} (${d.rootValue})`);
      } else if (qType === 2) {
        questionText = `What is the origin point of the "${correctMuscle.muscleName}"?`;
        correctAnswerText = correctMuscle.origin;
        wrongAnswersText = distractors.map(d => d.origin);
      } else {
        questionText = `Clinical Scenario: ${correctMuscle.clinicalImportance.split('.')[0]}. Which muscle is most likely involved or impaired?`;
        correctAnswerText = correctMuscle.muscleName;
        wrongAnswersText = distractors.map(d => d.muscleName);
      }

      // Compile options and shuffle
      const options = [correctAnswerText, ...wrongAnswersText]
        .map((text, idx) => ({ id: idx, text, isCorrect: text === correctAnswerText }))
        .sort(() => 0.5 - Math.random());

      const correctIndex = options.findIndex(o => o.isCorrect);

      questionsList.push({
        muscleName: correctMuscle.muscleName,
        question: questionText,
        options,
        correctIndex,
        clinicalInsight: correctMuscle.physiotherapyRelevance
      });
    }

    setQuizQuestions(questionsList);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsQuizAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizComplete(false);
    setCurrentView('quiz');
  };

  const handleQuizAnswerSelect = (idx: number) => {
    if (isQuizAnswerSubmitted) return;
    setSelectedAnswerIndex(idx);
  };

  const handleQuizAnswerSubmit = () => {
    if (selectedAnswerIndex === null || isQuizAnswerSubmitted) return;
    setIsQuizAnswerSubmitted(true);
    const isCorrect = quizQuestions[currentQuestionIndex].options[selectedAnswerIndex].isCorrect;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
      setIsQuizAnswerSubmitted(false);
    } else {
      setIsQuizComplete(true);
      // Reward bonus XP based on score
      const bonusXp = quizScore * 10 + (quizScore === 5 ? 50 : 0); // 10 XP per question, 50 XP bonus for perfect score
      addXp(bonusXp);
    }
  };

  // FLASHCARDS MODULE
  const activeFlashcards = useMemo(() => {
    return selectedRegion && selectedRegion !== 'ALL' 
      ? allMuscles.filter(m => m.region === selectedRegion) 
      : allMuscles;
  }, [selectedRegion]);

  const handleStartFlashcards = () => {
    setFlashcardIndex(0);
    setIsCardFlipped(false);
    setFlashcardStats({});
    setCurrentView('flashcards');
  };

  const handleFlashcardRating = (rating: 'easy' | 'medium' | 'hard') => {
    const m = activeFlashcards[flashcardIndex];
    setFlashcardStats(prev => ({ ...prev, [m.id]: rating }));

    // Small XP reward for reviewing cards
    addXp(5);

    if (flashcardIndex < activeFlashcards.length - 1) {
      setIsCardFlipped(false);
      setTimeout(() => {
        setFlashcardIndex(prev => prev + 1);
      }, 60);
    } else {
      alert(`Fantastic! You reviewed all ${activeFlashcards.length} cards in this deck and earned bonus XP!`);
      setCurrentView('list');
    }
  };

  // Progress metrics
  const regionProgress = useMemo(() => {
    const progress: Record<string, { total: number; learned: number }> = {};
    
    // Add 'ALL'
    progress['ALL'] = {
      total: allMuscles.length,
      learned: allMuscles.filter(m => learnedAnatomy.includes(m.id)).length
    };

    anatomyRegions.forEach(reg => {
      const regionMuscles = allMuscles.filter(m => m.region === reg.regionCode);
      progress[reg.regionCode] = {
        total: regionMuscles.length,
        learned: regionMuscles.filter(m => learnedAnatomy.includes(m.id)).length
      };
    });

    return progress;
  }, [learnedAnatomy]);

  return (
    <div className="h-auto min-h-0 bg-slate-950 pb-4 font-sans selection:bg-blue-900/30 antialiased w-full flex flex-col text-slate-100">
      {/* Upper Navigation Header */}
      <header className="bg-slate-950 border-b border-slate-800/80 py-3.5 px-1 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentView !== 'regions' ? (
              <button 
                onClick={() => {
                  if (currentView === 'quiz' || currentView === 'flashcards') {
                    if (confirm("Are you sure you want to exit your study session? Progress will be saved.")) {
                      setCurrentView('list');
                    }
                  } else if (currentView === 'detail') {
                    setCurrentView('list');
                  } else {
                    setCurrentView('regions');
                  }
                }}
                className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-100 transition-colors"
                id="btn-nav-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-100 transition-colors"
                id="btn-nav-home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h1 className="text-base font-black text-slate-100 tracking-tight leading-tight">Muscle Anatomy</h1>
              <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest leading-none mt-0.5">Complete Reference</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              👑 {xp} XP
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-4 pt-4">
        
        {/* VIEW 1: REGIONS DIRECTORY */}
        {currentView === 'regions' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <GraduationCap className="h-5 w-5" />
                <h3 className="font-extrabold text-slate-800 text-sm">Professional BPT Database</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Welcome to the skeletal muscle encyclopedia. Select any region below to review detailed origins, insertions, innervations, clinical relevance, and palpation notes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleRegionSelect('ALL')}
                  className="w-full inline-flex items-center justify-between bg-blue-50 border border-blue-100 hover:bg-blue-100/70 text-blue-700 text-xs font-extrabold py-3 px-4 rounded-xl transition-all"
                  id="btn-all-muscles"
                >
                  <span className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    Browse All Muscles (47 Total)
                  </span>
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {regionProgress['ALL']?.learned} / {regionProgress['ALL']?.total} Learned
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {anatomyRegions.map(reg => {
                const Icon = getRegionIcon(reg.regionCode);
                const progress = regionProgress[reg.regionCode] || { total: 0, learned: 0 };
                const percent = progress.total > 0 ? (progress.learned / progress.total) * 100 : 0;

                return (
                  <button
                    key={reg.regionCode}
                    onClick={() => handleRegionSelect(reg.regionCode)}
                    className="bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xs p-4 rounded-2xl text-left transition-all duration-200 focus:outline-none flex flex-col justify-between group"
                    id={`region-card-${reg.regionCode.toLowerCase()}`}
                  >
                    <div className="flex gap-4 items-start w-full">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                            {reg.name}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400">
                            {progress.total} {progress.total === 1 ? 'muscle' : 'muscles'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {reg.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 w-full space-y-1.5">
                      <div className="flex justify-between text-[9px] font-extrabold text-slate-400">
                        <span>LEARNING PROGRESS</span>
                        <span className="text-blue-600">{progress.learned} / {progress.total} MASTERED</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: MUSCLE LIST SCREEN */}
        {currentView === 'list' && (
          <div className="space-y-4">
            
            {/* Region Banner Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                  REGION QUEUE
                </span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">
                  {selectedRegion === 'ALL' ? 'All Skeletal Muscles' : anatomyRegions.find(r => r.regionCode === selectedRegion)?.name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStartFlashcards()}
                  className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Study Flashcards"
                  id="btn-flashcards-mode"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => startQuiz()}
                  className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Quiz Mode"
                  id="btn-quiz-mode"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Quiz</span>
                </button>
              </div>
            </div>

            {/* Quick Progress Bar */}
            <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs space-y-1.5">
              <div className="flex justify-between text-[10px] font-black text-slate-400">
                <span>REGION MASTERY</span>
                <span className="text-blue-600">
                  {regionProgress[selectedRegion || 'ALL']?.learned} / {regionProgress[selectedRegion || 'ALL']?.total} Learned
                </span>
              </div>
              <div className="h-2 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(regionProgress[selectedRegion || 'ALL']?.learned / regionProgress[selectedRegion || 'ALL']?.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, nerve, action, origin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    id="muscle-search-input"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                    showFilters || difficultyFilter !== 'all' || importanceFilter !== 'all' || learnedFilter !== 'all' || favoriteFilter
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                  id="btn-filter-toggle"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>

              {/* Collapsible Filter Panel */}
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3.5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase">Difficulty</label>
                      <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="BPT Viva">BPT Viva</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase">Exam Importance</label>
                      <select
                        value={importanceFilter}
                        onChange={(e) => setImportanceFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <option value="all">All Importance</option>
                        <option value="High">High Yield</option>
                        <option value="Medium">Medium Yield</option>
                        <option value="Low">Low Yield</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase">Learning State</label>
                      <select
                        value={learnedFilter}
                        onChange={(e) => setLearnedFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <option value="all">All Muscles</option>
                        <option value="learned">Learned Only</option>
                        <option value="unlearned">Unlearned Only</option>
                      </select>
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <button
                        onClick={() => setFavoriteFilter(!favoriteFilter)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors ${
                          favoriteFilter 
                            ? 'bg-rose-50 border-rose-100 text-rose-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${favoriteFilter ? 'fill-rose-500' : ''}`} />
                        <span>{favoriteFilter ? 'Favorites Active' : 'Filter Favorites'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                    <button 
                      onClick={() => {
                        setDifficultyFilter('all');
                        setImportanceFilter('all');
                        setLearnedFilter('all');
                        setFavoriteFilter(false);
                      }}
                      className="text-[10px] font-extrabold text-slate-400 hover:text-slate-600"
                    >
                      RESET FILTERS
                    </button>

                    <button 
                      onClick={() => setShowFilters(false)}
                      className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800"
                    >
                      CLOSE PANEL
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bulk Selection Toggle Panel */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setIsBulkSelectionActive(!isBulkSelectionActive);
                  setSelectedMuscleIdsForBulk([]);
                }}
                className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1 ${
                  isBulkSelectionActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                id="btn-bulk-toggle"
              >
                <ListChecks className="h-3.5 w-3.5" />
                <span>{isBulkSelectionActive ? 'Cancel Multi-Select' : 'Multi-Select'}</span>
              </button>

              <span className="text-[11px] font-bold text-slate-400">
                Found {filteredMuscles.length} {filteredMuscles.length === 1 ? 'muscle' : 'muscles'}
              </span>
            </div>

            {/* Bulk Actions Panel */}
            {isBulkSelectionActive && selectedMuscleIdsForBulk.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 text-white p-3.5 rounded-2xl flex flex-col gap-3 shadow-md"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold">{selectedMuscleIdsForBulk.length} muscles selected</span>
                  <button 
                    onClick={() => setSelectedMuscleIdsForBulk([])}
                    className="text-[10px] font-bold text-slate-400 hover:text-white"
                  >
                    Deselect All
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleBulkMarkAsLearned(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-extrabold py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Set Learned</span>
                  </button>
                  <button
                    onClick={() => handleBulkMarkAsLearned(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-[10px] font-extrabold py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear Learned</span>
                  </button>
                  <button
                    onClick={() => handleBulkToggleFavorite()}
                    className="bg-rose-600 hover:bg-rose-700 text-[10px] font-extrabold py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <Heart className="h-3 w-3 fill-white" />
                    <span>Fav/Unfav</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Muscles List Container */}
            <div className="space-y-2.5">
              {filteredMuscles.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 text-sm space-y-2">
                  <p className="font-semibold">No muscles match your filters.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setDifficultyFilter('all');
                      setImportanceFilter('all');
                      setLearnedFilter('all');
                      setFavoriteFilter(false);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                filteredMuscles.map(m => {
                  const isLearned = learnedAnatomy.includes(m.id);
                  const isFav = favoriteAnatomy.includes(m.id);
                  const isCheckedForBulk = selectedMuscleIdsForBulk.includes(m.id);

                  return (
                    <div
                      key={m.id}
                      className={`bg-white border rounded-2xl p-4 shadow-xs flex justify-between items-center transition-all ${
                        isCheckedForBulk 
                          ? 'border-blue-500 bg-blue-50/20' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                      id={`muscle-item-${m.id}`}
                    >
                      <div className="flex gap-3 items-center flex-1 min-w-0">
                        {isBulkSelectionActive && (
                          <button
                            onClick={() => handleToggleBulkSelect(m.id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isCheckedForBulk
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white hover:border-blue-400'
                            }`}
                          >
                            {isCheckedForBulk && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>
                        )}

                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (isBulkSelectionActive) {
                              handleToggleBulkSelect(m.id);
                            } else {
                              setSelectedMuscleId(m.id);
                              setCurrentView('detail');
                            }
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-slate-800 text-sm tracking-tight truncate">
                              {m.muscleName}
                            </h4>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              m.difficultyLevel === 'Easy' ? 'bg-green-50 text-green-700 border border-green-100' :
                              m.difficultyLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              m.difficultyLevel === 'Hard' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {m.difficultyLevel}
                            </span>
                            {m.examImportance === 'High' && (
                              <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                                HIGH YIELD
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                            Nerve: {m.nerve} ({m.rootValue})
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-relaxed">
                            {m.primaryAction}
                          </p>
                        </div>
                      </div>

                      {/* Side quick action toggles */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button
                          onClick={() => toggleFavoriteAnatomy(m.id)}
                          className={`p-2 rounded-xl transition-all ${
                            isFav 
                              ? 'text-rose-500 bg-rose-50 border border-rose-100/50' 
                              : 'text-slate-300 hover:text-slate-400 bg-slate-50 border border-slate-100'
                          }`}
                          title="Favorite"
                          id={`btn-fav-${m.id}`}
                        >
                          <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>

                        <button
                          onClick={() => {
                            toggleLearnedAnatomy(m.id);
                          }}
                          className={`p-2 rounded-xl transition-all ${
                            isLearned 
                              ? 'text-emerald-600 bg-emerald-50 border border-emerald-100/50' 
                              : 'text-slate-300 hover:text-slate-400 bg-slate-50 border border-slate-100'
                          }`}
                          title="Learned"
                          id={`btn-learned-${m.id}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: MUSCLE DETAIL VIEW */}
        {currentView === 'detail' && selectedMuscle && (
          <div className="space-y-4">
            
            {/* Upper Mini Controller */}
            <div className="flex justify-between items-center bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-xs">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                {currentMuscleIndexInFilteredList + 1} / {filteredMuscles.length} in List
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMuscle}
                  disabled={currentMuscleIndexInFilteredList === 0}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Previous Muscle"
                  id="detail-prev-btn"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextMuscle}
                  disabled={currentMuscleIndexInFilteredList === filteredMuscles.length - 1}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Next Muscle"
                  id="detail-next-btn"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Title & Core Meta */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
              
              <div className="flex justify-between items-start gap-3 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {selectedMuscle.region}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded uppercase">
                      {selectedMuscle.subRegion}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight" id="detail-muscle-title">
                    {selectedMuscle.muscleName}
                  </h2>
                  {selectedMuscle.alternateName && (
                    <p className="text-xs text-slate-400 font-semibold italic">
                      Also known as: {selectedMuscle.alternateName}
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleFavoriteAnatomy(selectedMuscle.id)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      favoriteAnatomy.includes(selectedMuscle.id)
                        ? 'text-rose-500 bg-rose-50 border-rose-100'
                        : 'text-slate-300 bg-slate-50 border-slate-100 hover:text-slate-400'
                    }`}
                    id="detail-fav-toggle"
                  >
                    <Heart className={`h-4 w-4 ${favoriteAnatomy.includes(selectedMuscle.id) ? 'fill-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => toggleLearnedAnatomy(selectedMuscle.id)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      learnedAnatomy.includes(selectedMuscle.id)
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        : 'text-slate-300 bg-slate-50 border-slate-100 hover:text-slate-400'
                    }`}
                    id="detail-learned-toggle"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick Specs Strip */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100/50 text-center">
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Difficulty</span>
                  <span className="block text-[11px] font-extrabold text-slate-700">{selectedMuscle.difficultyLevel}</span>
                </div>
                <div className="space-y-0.5 border-x border-slate-200">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Exam Yield</span>
                  <span className="block text-[11px] font-black text-amber-600">{selectedMuscle.examImportance}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Compartment</span>
                  <span className="block text-[11px] font-extrabold text-slate-700 truncate px-1">{selectedMuscle.compartment || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tabbed Info Block - Simple & High Contrast */}
            <div className="space-y-3">
              
              {/* OIAN SECTION (Origin, Insertion, Action, Nerve) */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  <span>OIAN Anatomy</span>
                </h4>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Origin Point</span>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/30">
                      {selectedMuscle.origin}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Insertion Point</span>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/30">
                      {selectedMuscle.insertion}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Primary Action</span>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed bg-blue-50/20 p-2.5 rounded-xl border border-blue-100/30">
                      {selectedMuscle.primaryAction}
                    </p>
                  </div>

                  {selectedMuscle.secondaryActions && selectedMuscle.secondaryActions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Secondary Actions</span>
                      <ul className="list-disc pl-4 text-xs font-semibold text-slate-600 space-y-1">
                        {selectedMuscle.secondaryActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nerve & Root Value</span>
                    <div className="bg-amber-50/20 border border-amber-100/50 p-3 rounded-xl space-y-1">
                      <p className="text-xs font-extrabold text-amber-900">
                        {selectedMuscle.nerve}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500">
                        Full Innervation: {selectedMuscle.innervation}
                      </p>
                      <p className="text-[11px] font-bold text-blue-600">
                        Root Values: {selectedMuscle.rootValue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CLINICAL & PHYSIO RELEVANCE SECTION */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  <span>Clinical & Physio Relevance</span>
                </h4>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">Clinical Importance</span>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed bg-rose-50/10 p-3 rounded-xl border border-rose-100/30">
                      {selectedMuscle.clinicalImportance}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block">Physiotherapy Core Integration</span>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed bg-blue-50/10 p-3 rounded-xl border border-blue-100/30">
                      {selectedMuscle.physiotherapyRelevance}
                    </p>
                  </div>

                  {selectedMuscle.palpationInformation && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Palpation & Assessment</span>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {selectedMuscle.palpationInformation}
                      </p>
                    </div>
                  )}

                  {selectedMuscle.commonConditions && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Common Pathologies</span>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                        {selectedMuscle.commonConditions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ANATOMICAL RELATIONS & MNEMONICS / EXCEPTIONS */}
              {(selectedMuscle.mnemonic || selectedMuscle.anatomicalRelations || selectedMuscle.bloodSupply) && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>Memory & Relations</span>
                  </h4>

                  <div className="space-y-3.5">
                    {selectedMuscle.bloodSupply && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Arterial Blood Supply</span>
                        <p className="text-xs font-semibold text-slate-600">
                          {selectedMuscle.bloodSupply}
                        </p>
                      </div>
                    )}

                    {selectedMuscle.anatomicalRelations && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Anatomical Relations</span>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                          {selectedMuscle.anatomicalRelations}
                        </p>
                      </div>
                    )}

                    {selectedMuscle.mnemonic && (
                      <div className="bg-purple-50/30 border border-purple-100 p-3 rounded-xl flex gap-3 items-start">
                        <AlertCircle className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-purple-600 uppercase">Viva Mnemonic</span>
                          <p className="text-xs font-black text-purple-900 italic">
                            &quot;{selectedMuscle.mnemonic}&quot;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={() => setCurrentView('list')}
              className="w-full bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-xs hover:bg-slate-700 active:scale-98 transition-all text-xs tracking-wider"
              id="detail-back-to-list-btn"
            >
              ← RETURN TO REGION LIST
            </button>
          </div>
        )}

        {/* VIEW 4: QUIZ MODE */}
        {currentView === 'quiz' && quizQuestions.length > 0 && (
          <div className="space-y-4">
            
            {!isQuizComplete ? (
              <div className="space-y-4">
                {/* Header Progress */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex justify-between items-center">
                  <span className="text-xs font-black text-blue-600">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
                    Score: {quizScore} / {quizQuestions.length}
                  </span>
                </div>

                {/* Progress Mini Bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question Block */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex gap-2 items-start">
                    <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <h3 className="font-extrabold text-slate-800 text-sm leading-relaxed">
                      {quizQuestions[currentQuestionIndex].question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 pt-2">
                    {quizQuestions[currentQuestionIndex].options.map((option: any, idx: number) => {
                      const isSelected = selectedAnswerIndex === idx;
                      const isCorrectAnswer = option.isCorrect;
                      
                      let optionStyle = 'border-slate-200 bg-white hover:border-blue-400';
                      if (isSelected) {
                        optionStyle = 'border-blue-500 bg-blue-50/30';
                      }
                      if (isQuizAnswerSubmitted) {
                        if (isCorrectAnswer) {
                          optionStyle = 'border-emerald-500 bg-emerald-50/40 text-emerald-900';
                        } else if (isSelected) {
                          optionStyle = 'border-rose-500 bg-rose-50/40 text-rose-900';
                        } else {
                          optionStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswerSelect(idx)}
                          disabled={isQuizAnswerSubmitted}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold leading-relaxed transition-all flex items-center justify-between ${optionStyle}`}
                          id={`quiz-option-${idx}`}
                        >
                          <span>{option.text}</span>
                          {isQuizAnswerSubmitted && isCorrectAnswer && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit / Next Button */}
                {!isQuizAnswerSubmitted ? (
                  <button
                    onClick={handleQuizAnswerSubmit}
                    disabled={selectedAnswerIndex === null}
                    className="w-full bg-blue-600 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-xs disabled:opacity-50 hover:bg-blue-700 active:scale-98 transition-all text-xs tracking-wider"
                    id="btn-quiz-submit"
                  >
                    SUBMIT ANSWER
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Insight Card */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-1">
                      <span className="text-[9px] font-black text-blue-600 uppercase">Clinical Insight</span>
                      <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                        {quizQuestions[currentQuestionIndex].clinicalInsight}
                      </p>
                    </div>

                    <button
                      onClick={handleNextQuizQuestion}
                      className="w-full bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-xs hover:bg-slate-700 active:scale-98 transition-all text-xs tracking-wider"
                      id="btn-quiz-next"
                    >
                      {currentQuestionIndex === quizQuestions.length - 1 ? 'FINISH QUIZ' : 'NEXT QUESTION →'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Quiz Finished Screen
              <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-md space-y-6">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                  <Trophy className="h-8 w-8 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-800">Quiz Completed!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You answered {quizScore} out of {quizQuestions.length} questions correctly.
                  </p>
                </div>

                {/* Score Summary Metrics */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-3 text-center">
                  <div className="space-y-0.5">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase">XP Awarded</span>
                    <span className="block text-sm font-black text-emerald-600">+{quizScore * 10 + (quizScore === 5 ? 50 : 0)} XP</span>
                  </div>
                  <div className="space-y-0.5 border-l border-slate-200">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Accuracy</span>
                    <span className="block text-sm font-black text-blue-600">{(quizScore / quizQuestions.length) * 100}%</span>
                  </div>
                </div>

                {quizScore === 5 && (
                  <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-[11px] font-black text-amber-800">
                    🎉 PERFECT SCORE! Earned a +50 XP Master Bonus!
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={startQuiz}
                    className="bg-blue-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-xs text-xs tracking-wide"
                  >
                    RETRY QUIZ
                  </button>
                  <button
                    onClick={() => setCurrentView('list')}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold py-3 px-4 rounded-xl text-xs tracking-wide"
                  >
                    BACK TO LIST
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: FLASHCARD MODE */}
        {currentView === 'flashcards' && activeFlashcards.length > 0 && (
          <div className="space-y-4">
            
            {/* Header progress info */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
              <span>ACTIVE RECALL CONTEXT</span>
              <span>
                Card {flashcardIndex + 1} of {activeFlashcards.length}
              </span>
            </div>

            {/* Flashcard Component */}
            <div 
              className="relative h-[25rem] w-full [perspective:1000px] cursor-pointer"
              onClick={() => setIsCardFlipped(!isCardFlipped)}
            >
              <div 
                className={`relative w-full h-full duration-250 [transform-style:preserve-3d] ${
                  isCardFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* FRONT SIDE */}
                <div className="absolute inset-0 w-full h-full bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between [backface-visibility:hidden]">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                      SKELETAL ANATOMY CARD
                    </span>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {activeFlashcards[flashcardIndex].region}
                    </span>
                  </div>

                  <div className="text-center space-y-2 py-8">
                    <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest">Identify the Muscle</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight" id="flashcard-muscle-name">
                      {activeFlashcards[flashcardIndex].muscleName}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold italic">
                      {activeFlashcards[flashcardIndex].alternateName || 'Standard Anatomical Term'}
                    </p>
                  </div>

                  <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-1">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Primary Action clue</span>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-2">
                      &quot;{activeFlashcards[flashcardIndex].primaryAction}&quot;
                    </p>
                  </div>

                  <button className="w-full bg-slate-100 text-slate-700 text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>REVEAL ANSWER & DETAILED OIAN</span>
                  </button>
                </div>

                {/* BACK SIDE */}
                <div className="absolute inset-0 w-full h-full bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2 shrink-0">
                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      REVEALED SPECS
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Innervation: {activeFlashcards[flashcardIndex].rootValue}
                    </span>
                  </div>

                  <div className="space-y-3.5 my-4 overflow-y-auto pr-1 flex-1">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Origin</span>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{activeFlashcards[flashcardIndex].origin}</p>
                    </div>

                    <div className="space-y-0.5 border-t border-slate-50 pt-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Insertion</span>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{activeFlashcards[flashcardIndex].insertion}</p>
                    </div>

                    <div className="space-y-0.5 border-t border-slate-50 pt-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Innervation</span>
                      <p className="text-xs font-bold text-slate-800">{activeFlashcards[flashcardIndex].innervation}</p>
                    </div>

                    <div className="space-y-0.5 border-t border-slate-50 pt-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Clinical Importance</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{activeFlashcards[flashcardIndex].clinicalImportance}</p>
                    </div>
                  </div>

                  <span className="text-center text-[10px] font-extrabold text-blue-500 py-1 uppercase block shrink-0">
                    TAP CARD TO FLIP BACK
                  </span>
                </div>
              </div>
            </div>

            {/* Self-Assessment Scoring panel */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">
                RATE YOUR RECALL CONFIDENCE FOR THIS CARD
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleFlashcardRating('hard')}
                  className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-extrabold transition-all"
                >
                  Hard ✖
                </button>
                <button
                  onClick={() => handleFlashcardRating('medium')}
                  className="bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-extrabold transition-all"
                >
                  Medium ⚡
                </button>
                <button
                  onClick={() => handleFlashcardRating('easy')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-extrabold transition-all"
                >
                  Easy ✔
                </button>
              </div>
            </div>

            {/* Back to list button */}
            <button
              onClick={() => setCurrentView('list')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 rounded-xl text-xs"
            >
              EXIT DECK REVIEW
            </button>
          </div>
        )}

      </main>

      {/* Global Bottom Navigation */}
      <Navigation />
    </div>
  );
}
