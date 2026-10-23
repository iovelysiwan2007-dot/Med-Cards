'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, CheckCircle2, AlertTriangle, RefreshCcw, 
  ArrowLeft, HelpCircle, ChevronRight, Eye, EyeOff, 
  Award, Flame, Trophy, Star, Sparkles, HeartPulse,
  Brain, Check, X, ClipboardList
} from 'lucide-react';
import { usePhysio } from '../../context/PhysioContext';
import { muscles, Muscle } from '../../data/muscles';
import Navigation from '../../components/Navigation';

// Define the generated Quiz Question schema
interface Question {
  id: number;
  type: 'origin' | 'insertion' | 'nerve' | 'action' | 'clinical';
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  muscleName: string;
}

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Helper to sanitize clinical text by masking the correct answer
const maskMuscleNameInText = (text: string, name: string): string => {
  const regex = new RegExp(name, 'gi');
  return text.replace(regex, '--- [affected muscle] ---');
};

export default function DailyQuizPage() {
  const { xp, addXp, saveQuizSession } = usePhysio();

  // Quiz States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStatus, setQuizStatus] = useState<'welcome' | 'playing' | 'complete'>('welcome');
  
  // History tracking for review at the end
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [xpEarnedInSession, setXpEarnedInSession] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Time taken states
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Function to dynamically generate 5 highly robust questions
  const generateNewQuiz = () => {
    setIsTransitioning(false);
    const shuffledMuscles = shuffleArray(muscles);
    const selectedMuscles = shuffledMuscles.slice(0, 5);
    
    // Assign 5 distinct types to 5 distinct muscles
    const types: ('origin' | 'insertion' | 'nerve' | 'action' | 'clinical')[] = [
      'origin',
      'insertion',
      'nerve',
      'action',
      'clinical'
    ];
    const shuffledTypes = shuffleArray(types);

    const generatedQuestions: Question[] = selectedMuscles.map((muscle, index) => {
      const type = shuffledTypes[index];
      let questionText = '';
      let correctAnswer = '';
      let options: string[] = [];
      let explanation = '';

      // Helper to generate 3 unique muscle name distractors
      const getNameDistractors = (correctName: string): string[] => {
        const filtered = muscles.filter(m => m.name !== correctName);
        return shuffleArray(filtered).slice(0, 3).map(m => m.name);
      };

      // Helper to generate 3 unique nerve supply distractors
      const getNerveDistractors = (correctNerve: string): string[] => {
        const uniqueNerves = Array.from(new Set(muscles.map(m => m.nerveSupply)))
          .filter(n => n !== correctNerve);
        return shuffleArray(uniqueNerves).slice(0, 3);
      };

      // Helper to generate 3 unique action distractors
      const getActionDistractors = (correctAction: string): string[] => {
        const uniqueActions = Array.from(new Set(muscles.map(m => m.action)))
          .filter(a => a !== correctAction);
        return shuffleArray(uniqueActions).slice(0, 3);
      };

      switch (type) {
        case 'origin':
          questionText = `Identify the muscle that has its origin at the following site: "${muscle.origin}"`;
          correctAnswer = muscle.name;
          options = shuffleArray([correctAnswer, ...getNameDistractors(muscle.name)]);
          explanation = `The ${muscle.name} originates from the ${muscle.origin} and inserts into the ${muscle.insertion}.`;
          break;

        case 'insertion':
          questionText = `Which muscle has its insertion at the "${muscle.insertion}"?`;
          correctAnswer = muscle.name;
          options = shuffleArray([correctAnswer, ...getNameDistractors(muscle.name)]);
          explanation = `The ${muscle.name} inserts into the ${muscle.insertion}.`;
          break;

        case 'nerve':
          questionText = `What is the nerve supply (innervation) of the ${muscle.name} muscle?`;
          correctAnswer = muscle.nerveSupply;
          options = shuffleArray([correctAnswer, ...getNerveDistractors(muscle.nerveSupply)]);
          explanation = `The ${muscle.name} is supplied by the ${muscle.nerveSupply}.`;
          break;

        case 'action':
          questionText = `Which of the following muscles is primarily responsible for: "${muscle.action}"?`;
          correctAnswer = muscle.name;
          options = shuffleArray([correctAnswer, ...getNameDistractors(muscle.name)]);
          explanation = `The primary action of the ${muscle.name} is: ${muscle.action}`;
          break;

        case 'clinical':
        default:
          const maskedClinical = maskMuscleNameInText(muscle.clinicalRelevance, muscle.name);
          questionText = `Clinical Vignette: A physiotherapy patient presents with symptoms or findings related to: "${maskedClinical}" Which muscle is most likely affected or evaluated?`;
          correctAnswer = muscle.name;
          options = shuffleArray([correctAnswer, ...getNameDistractors(muscle.name)]);
          explanation = `This clinical scenario describes testing or pathology of the ${muscle.name}.`;
          break;
      }

      return {
        id: index + 1,
        type,
        questionText,
        options,
        correctAnswer,
        explanation,
        muscleName: muscle.name
      };
    });

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswers({});
    setXpEarnedInSession(0);
    setStartTime(Date.now());
    setQuizStatus('playing');
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setXpEarnedInSession(prev => prev + 10);
    }
  };

  const finishQuizSession = (finalAnswers: Record<number, string>) => {
    const totalQuestions = questions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const quizQuestionsMapped = questions.map((q, idx) => {
      const selected = finalAnswers[idx] || 'SKIPPED';
      const isCorrect = selected === q.correctAnswer;
      if (selected === 'SKIPPED') {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
      return {
        questionText: q.questionText,
        type: q.type,
        correctAnswer: q.correctAnswer,
        selectedAnswer: selected,
        isCorrect
      };
    });

    const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const baseXP = correctCount * 10;
    const perfectBonus = correctCount === 5 ? 20 : 0;
    const finishBonus = 10;
    const finalXPEarned = baseXP + perfectBonus + finishBonus;

    saveQuizSession({
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      skippedAnswers: skippedCount,
      score: correctCount,
      accuracy,
      timeTaken: elapsed,
      questions: quizQuestionsMapped
    });

    setScore(correctCount);
    setElapsedTime(elapsed);
    setXpEarnedInSession(finalXPEarned);
    addXp(finalXPEarned);
    setQuizStatus('complete');
  };

  const handleSkip = () => {
    if (isAnswered || isTransitioning) return;
    setIsTransitioning(true);
    
    const updatedAnswers = { ...userAnswers, [currentQuestionIndex]: "SKIPPED" };
    setUserAnswers(updatedAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    } else {
      setIsTransitioning(false);
      finishQuizSession(updatedAnswers);
    }
  };

  const handleNextQuestion = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    } else {
      setIsTransitioning(false);
      finishQuizSession(userAnswers);
    }
  };

  // Performance Badge logic
  const getPerformanceBadge = (finalScore: number) => {
    if (finalScore === 5) return { label: 'Clinical Genius 🧠', color: 'from-amber-500 to-yellow-500 text-amber-950 bg-amber-50 border-amber-100' };
    if (finalScore >= 3) return { label: 'Aesthetic Practitioner 🩺', color: 'from-blue-500 to-indigo-500 text-blue-950 bg-blue-50 border-blue-100' };
    return { label: 'Needs Practice 📚', color: 'from-slate-500 to-slate-600 text-slate-900 bg-slate-50 border-slate-150' };
  };

  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const activeQuestion = questions[currentQuestionIndex];
  const activeBadge = getPerformanceBadge(score);

  return (
    <div className="h-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-900 pb-4 font-sans selection:bg-blue-100 relative w-full flex flex-col">
      
      {/* Quiz Header Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-3 px-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-5 w-px bg-slate-100 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Brain className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">Daily MCQ Arena</span>
          </div>
        </div>

        {/* Live Score Tracker */}
        {quizStatus === 'playing' && (
          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-xl border border-blue-100 dark:border-blue-900/30 font-black text-xs">
            Score: {score}/{questions.length}
          </div>
        )}
      </header>

      {/* Screen 1: Welcome/Diagnostic Screen */}
      {quizStatus === 'welcome' && (
        <main className="w-full px-4 pt-4 text-center space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-2 border border-blue-100 dark:border-blue-900/35 animate-pulse">
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Clinical MCQ</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Test your high-yield BPT knowledge! Take a fast, 5-question dynamic quiz generated directly from our 30-muscle anatomical database.
            </p>
          </div>

          {/* Quick Stats list */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs text-left space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>MCQ SPECIFICATIONS</span>
              <span className="text-blue-600">Dynamic 5-Item Set</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>✦ Correct Answer</span>
                <span className="text-emerald-600">+10 XP</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>✦ Complete Session</span>
                <span className="text-indigo-600">+10 XP bonus</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>✦ Perfect Score 5/5</span>
                <span className="text-amber-600">+20 XP bonus</span>
              </div>
            </div>
          </div>

          <button
            onClick={generateNewQuiz}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-4 px-4 rounded-2xl shadow-md active:scale-98 transition-all text-sm tracking-wide"
          >
            START DAILY MCQ QUIZ
          </button>
        </main>
      )}

      {/* Screen 2: Interactive Quiz Board */}
      {quizStatus === 'playing' && activeQuestion && (
        <main className="w-full px-4 pt-4 space-y-5">
          
          {/* Question Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-blue-600">{Math.round(progressPercent)}% Done</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Display Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {activeQuestion.type.toUpperCase()} QUESTION
              </span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">ClinicalIQ Core</span>
            </div>

            <p className="text-sm font-bold text-slate-800 leading-relaxed pt-1">
              {activeQuestion.questionText}
            </p>
          </div>

          {/* MCQ Option Cards */}
          <div className="space-y-2.5">
            {activeQuestion.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === activeQuestion.correctAnswer;
              
              let cardStyle = "bg-white border-slate-200 hover:border-slate-300 text-slate-700";
              let iconElement = null;

              if (isAnswered) {
                if (isCorrect) {
                  // Always highlight correct option green after submit
                  cardStyle = "bg-emerald-50 border-emerald-300 text-emerald-950";
                  iconElement = <Check className="h-4 w-4 text-emerald-600 shrink-0" />;
                } else if (isSelected) {
                  // Highlight incorrect selection red
                  cardStyle = "bg-rose-50 border-rose-300 text-rose-950";
                  iconElement = <X className="h-4 w-4 text-rose-600 shrink-0" />;
                } else {
                  cardStyle = "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60";
                }
              } else if (isSelected) {
                cardStyle = "bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/10";
              }

              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-3 ${cardStyle}`}
                >
                  <span className="leading-normal">{option}</span>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Feedback & Navigation Section */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl border border-slate-150 bg-slate-50 space-y-2 text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
                  {selectedOption === activeQuestion.correctAnswer ? (
                    <span className="text-emerald-600 flex items-center gap-1">🎉 CORRECT! (+10 XP)</span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1">⚠ INCORRECT</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {activeQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Confirm/Next Button */}
          <div>
            {!isAnswered ? (
              <button
                onClick={handleSkip}
                className="w-full inline-flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold py-3.5 px-4 rounded-2xl shadow-xs transition-colors text-xs uppercase tracking-wider cursor-pointer"
              >
                SKIP QUESTION
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xs transition-colors text-xs uppercase tracking-wider flex justify-between px-6 cursor-pointer"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? 'NEXT QUESTION' : 'VIEW FINAL RESULTS'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

        </main>
      )}

      {/* Screen 3: End of Quiz Summary Screen */}
      {quizStatus === 'complete' && (
        <main className="w-full px-4 pt-10 text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-2 border border-blue-100 animate-bounce">
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{score}/5 Core Correct</h2>
            
            {/* Custom Performance Badge badge */}
            <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mx-auto ${activeBadge.color}`}>
              {activeBadge.label}
            </div>
          </div>

          {/* Statistical Breakdown Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-100">
              <span>XP REWARD BREAKDOWN</span>
              <span className="text-emerald-600 font-extrabold">+{xpEarnedInSession} XP Total</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl">
                <span className="block text-xl font-black text-slate-700">+{score * 10} XP</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Core Answers</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl">
                <span className="block text-xl font-black text-indigo-600">+{score === 5 ? '30' : '10'} XP</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Milestone Bonuses</span>
              </div>
            </div>

            {/* Real Statistics Scorecard */}
            <div className="bg-slate-50/50 border border-slate-100/80 p-4 rounded-2xl space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinical Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-semibold">Total Attempted:</span>
                  <span className="font-extrabold text-slate-800">{questions.length}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-semibold">Real Accuracy:</span>
                  <span className="font-extrabold text-indigo-600">
                    {questions.length > 0 ? Math.round((questions.filter((q, idx) => userAnswers[idx] === q.correctAnswer).length / questions.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-emerald-600 font-semibold">Correct Answers:</span>
                  <span className="font-extrabold text-emerald-600">
                    {questions.filter((q, idx) => userAnswers[idx] === q.correctAnswer).length}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-rose-600 font-semibold">Wrong Answers:</span>
                  <span className="font-extrabold text-rose-600">
                    {questions.filter((q, idx) => userAnswers[idx] !== undefined && userAnswers[idx] !== "SKIPPED" && userAnswers[idx] !== q.correctAnswer).length}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold">Skipped / Unanswered:</span>
                  <span className="font-extrabold text-slate-500">
                    {questions.filter((q, idx) => userAnswers[idx] === "SKIPPED" || userAnswers[idx] === undefined).length}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-semibold">Time Taken:</span>
                  <span className="font-extrabold text-slate-800">
                    {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
                  </span>
                </div>
              </div>

              {/* Topic-Wise Performance */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Topic-Wise Diagnostics</h5>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {Array.from(new Set(questions.map(q => q.type))).map(type => {
                    const topicQuestions = questions.filter(q => q.type === type);
                    const correctTopic = topicQuestions.filter((q, idx) => {
                      const originalIndex = questions.indexOf(q);
                      return userAnswers[originalIndex] === q.correctAnswer;
                    }).length;
                    
                    return (
                      <div key={type} className="flex justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-500 uppercase tracking-wider">{type}</span>
                        <span className="font-extrabold text-slate-700">{correctTopic}/{topicQuestions.length}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Question Review Breakdown */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Itemized Performance Review</h4>
              <div className="space-y-2.5">
                {questions.map((q, idx) => {
                  const userAns = userAnswers[idx];
                  const isCorrect = userAns === q.correctAnswer;

                  return (
                    <div key={q.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/30 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Q{q.id}. {q.muscleName} ({q.type.toUpperCase()})</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                        {q.questionText}
                      </p>
                      <div className="text-[10px] text-slate-500 font-bold space-y-0.5 pt-1 border-t border-slate-100/50">
                        <div>Your answer: <span className={isCorrect ? "text-emerald-600" : "text-rose-600"}>{userAns || 'None'}</span></div>
                        {!isCorrect && <div>Correct answer: <span className="text-emerald-600">{q.correctAnswer}</span></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-3">
            <button
              onClick={generateNewQuiz}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-4 px-4 rounded-2xl shadow-md active:scale-98 transition-all text-sm tracking-wide"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>RETAKE DAILY MCQ QUIZ</span>
            </button>

            <Link
              href="/flashcards"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl active:scale-98 transition-all text-sm tracking-wide"
            >
              <span>GO TO FLASHCARDS</span>
            </Link>
          </div>
        </main>
      )}

      {/* Navigation menu */}
      <Navigation />
    </div>
  );
}
