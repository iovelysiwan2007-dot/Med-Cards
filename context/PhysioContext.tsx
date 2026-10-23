'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { muscles, TODAYS_MUSCLE_IDS } from '../data/muscles';

export interface QuizSession {
  id: string;
  timestamp: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  score: number;
  accuracy: number;
  timeTaken: number; // in seconds
  questions: {
    questionText: string;
    type: string;
    correctAnswer: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
}

interface AppState {
  completedMuscles: string[];
  todayCompleted: string[];
  streak: number;
  lastActiveDate: string | null;
  xp: number;
  muscleMastery: Record<string, number>;
  studentName?: string;
  studentAge?: string;
  studentCourse?: string;
  studentYear?: string;
  studentInstitution?: string;
  learnedAnatomy?: string[];
  favoriteAnatomy?: string[];
  quizHistory?: QuizSession[];
}

interface PhysioContextType {
  completedMuscles: string[];
  todayCompleted: string[];
  streak: number;
  lastActiveDate: string | null;
  xp: number;
  muscleMastery: Record<string, number>;
  studentName: string;
  studentAge: string;
  studentCourse: string;
  studentYear: string;
  studentInstitution: string;
  learnedAnatomy: string[];
  favoriteAnatomy: string[];
  quizHistory: QuizSession[];
  markAsLearned: (id: string) => void;
  resetProgress: () => void;
  isLoading: boolean;
  addXp: (amount: number) => void;
  updateMastery: (id: string, mastery: number) => void;
  completeMusclePuzzle: (id: string, accuracy: number, earnedXp: number) => void;
  updateProfile: (name: string, age: string, course: string, year: string, institution: string) => void;
  toggleLearnedAnatomy: (id: string) => void;
  toggleFavoriteAnatomy: (id: string) => void;
  saveQuizSession: (session: Omit<QuizSession, 'id' | 'timestamp'>) => void;
}

const PhysioContext = createContext<PhysioContextType | undefined>(undefined);

export function PhysioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    completedMuscles: [],
    todayCompleted: [],
    streak: 0,
    lastActiveDate: null,
    xp: 0,
    muscleMastery: {},
    studentName: 'BPT Student',
    studentAge: '',
    studentCourse: 'Bachelor of Physiotherapy',
    studentYear: '1st Year',
    studentInstitution: '',
    learnedAnatomy: [],
    favoriteAnatomy: [],
    quizHistory: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount (single status update)
  useEffect(() => {
    try {
      let stored = localStorage.getItem('clinicaliq_state');
      if (!stored) {
        stored = localStorage.getItem('medcards_state');
      }
      if (!stored) {
        stored = localStorage.getItem('physiocards_state');
      }
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

      if (stored) {
        const parsed = JSON.parse(stored);
        const loadedCompleted = parsed.completedMuscles || [];
        let loadedToday = parsed.todayCompleted || [];
        let loadedStreak = parsed.streak || 0;
        const loadedDate = parsed.lastActiveDate || null;
        const loadedXp = parsed.xp || 0;
        const loadedMastery = parsed.muscleMastery || {};
        const loadedName = parsed.studentName || 'Med Student';
        const loadedAge = parsed.studentAge || '';
        const loadedCourse = parsed.studentCourse || 'MBBS / Medical Student';
        const loadedYear = parsed.studentYear || '1st Year';
        const loadedInstitution = parsed.studentInstitution || '';
        const loadedLearnedAnatomy = parsed.learnedAnatomy || [];
        const loadedFavoriteAnatomy = parsed.favoriteAnatomy || [];
        const loadedQuizHistory = parsed.quizHistory || [];

        let finalStreak = loadedStreak;
        let finalTodayCompleted = loadedToday;

        if (loadedDate && loadedDate !== todayStr) {
          // If the day changed, check if streak should be preserved or reset
          const lastDateObj = new Date(loadedDate);
          const todayObj = new Date(todayStr);
          const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            // Broke the streak
            finalStreak = 0;
          }
          // Reset today's completed for the new day
          finalTodayCompleted = [];
          
          // Save new daily initial state
          const updatedState = {
            completedMuscles: loadedCompleted,
            todayCompleted: [],
            streak: finalStreak,
            lastActiveDate: todayStr,
            xp: loadedXp,
            muscleMastery: loadedMastery,
            studentName: loadedName,
            studentAge: loadedAge,
            studentCourse: loadedCourse,
            studentYear: loadedYear,
            studentInstitution: loadedInstitution,
            learnedAnatomy: loadedLearnedAnatomy,
            favoriteAnatomy: loadedFavoriteAnatomy,
            quizHistory: loadedQuizHistory,
          };
          localStorage.setItem('clinicaliq_state', JSON.stringify(updatedState));
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({
          completedMuscles: loadedCompleted,
          todayCompleted: finalTodayCompleted,
          streak: finalStreak,
          lastActiveDate: todayStr,
          xp: loadedXp,
          muscleMastery: loadedMastery,
          studentName: loadedName,
          studentAge: loadedAge,
          studentCourse: loadedCourse,
          studentYear: loadedYear,
          studentInstitution: loadedInstitution,
          learnedAnatomy: loadedLearnedAnatomy,
          favoriteAnatomy: loadedFavoriteAnatomy,
          quizHistory: loadedQuizHistory,
        });
      } else {
        setState({
          completedMuscles: [],
          todayCompleted: [],
          streak: 0,
          lastActiveDate: todayStr,
          xp: 0,
          muscleMastery: {},
          studentName: 'BPT Student',
          studentAge: '',
          studentCourse: 'Bachelor of Physiotherapy',
          studentYear: '1st Year',
          studentInstitution: '',
          learnedAnatomy: [],
          favoriteAnatomy: [],
          quizHistory: [],
        });
      }
    } catch (e) {
      console.error('Error loading localStorage state', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addXp = (amount: number) => {
    if (isLoading) return;
    setState((prev) => {
      const newXp = prev.xp + amount;
      const stateToSave = { ...prev, xp: newXp };
      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  const updateMastery = (id: string, mastery: number) => {
    if (isLoading) return;
    setState((prev) => {
      const newMastery = { ...prev.muscleMastery, [id]: Math.min(100, Math.max(0, mastery)) };
      const stateToSave = { ...prev, muscleMastery: newMastery };
      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  const completeMusclePuzzle = (id: string, accuracy: number, earnedXp: number) => {
    if (isLoading) return;
    setState((prev) => {
      const newCompleted = prev.completedMuscles.includes(id)
        ? prev.completedMuscles
        : [...prev.completedMuscles, id];

      const isTodayMuscle = TODAYS_MUSCLE_IDS.includes(id);
      const newToday = isTodayMuscle
        ? (prev.todayCompleted.includes(id) ? prev.todayCompleted : [...prev.todayCompleted, id])
        : prev.todayCompleted;

      const todayStr = new Date().toLocaleDateString('en-CA');
      let newStreak = prev.streak;

      // Handle streak update: if they complete any puzzle today and streak hasn't been bumped today
      if (prev.lastActiveDate !== todayStr) {
        if (prev.lastActiveDate) {
          const lastDateObj = new Date(prev.lastActiveDate);
          const todayObj = new Date(todayStr);
          const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      } else if (newStreak === 0) {
        newStreak = 1;
      }

      // Mastery: 100% since they solved the puzzle
      const newMastery = { ...prev.muscleMastery, [id]: 100 };
      const newXp = prev.xp + earnedXp;

      const stateToSave = {
        completedMuscles: newCompleted,
        todayCompleted: newToday,
        streak: newStreak,
        lastActiveDate: todayStr,
        xp: newXp,
        muscleMastery: newMastery
      };

      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  // Save to localStorage when state changes
  const markAsLearned = (id: string) => {
    if (isLoading) return;

    setState((prev) => {
      const newCompleted = prev.completedMuscles.includes(id)
        ? prev.completedMuscles
        : [...prev.completedMuscles, id];
      
      const isTodayMuscle = TODAYS_MUSCLE_IDS.includes(id);
      const newToday = isTodayMuscle 
        ? (prev.todayCompleted.includes(id) ? prev.todayCompleted : [...prev.todayCompleted, id])
        : prev.todayCompleted;

      const todayStr = new Date().toLocaleDateString('en-CA');
      let newStreak = prev.streak;

      if (prev.lastActiveDate !== todayStr) {
        if (prev.lastActiveDate) {
          const lastDateObj = new Date(prev.lastActiveDate);
          const todayObj = new Date(todayStr);
          const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      } else if (newStreak === 0) {
        // Starting their streak today
        newStreak = 1;
      }

      // If they mark as learned, let's also set mastery to 100%
      const newMastery = { ...prev.muscleMastery, [id]: 100 };

      const stateToSave = {
        completedMuscles: newCompleted,
        todayCompleted: newToday,
        streak: newStreak,
        lastActiveDate: todayStr,
        xp: prev.xp,
        muscleMastery: newMastery
      };

      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  const resetProgress = () => {
    setState({
      completedMuscles: [],
      todayCompleted: [],
      streak: 0,
      lastActiveDate: new Date().toLocaleDateString('en-CA'),
      xp: 0,
      muscleMastery: {},
      studentName: 'BPT Student',
      studentAge: '',
      studentCourse: 'Bachelor of Physiotherapy',
      studentYear: '1st Year',
      studentInstitution: '',
      learnedAnatomy: [],
      favoriteAnatomy: [],
      quizHistory: [],
    });
    localStorage.removeItem('clinicaliq_state');
    localStorage.removeItem('medcards_state');
    localStorage.removeItem('physiocards_state');
  };

  const updateProfile = (name: string, age: string, course: string, year: string, institution: string) => {
    if (isLoading) return;
    setState((prev) => {
      const stateToSave = {
        ...prev,
        studentName: name,
        studentAge: age,
        studentCourse: course,
        studentYear: year,
        studentInstitution: institution,
      };
      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  const toggleLearnedAnatomy = (id: string) => {
    if (isLoading) return;
    setState((prev) => {
      const current = prev.learnedAnatomy || [];
      const newLearned = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      
      const earnedXp = !current.includes(id) ? 15 : 0; // Earn 15 XP for learning a new anatomy muscle!
      const newXp = prev.xp + earnedXp;

      const stateToSave = {
        ...prev,
        learnedAnatomy: newLearned,
        xp: newXp
      };
      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  const toggleFavoriteAnatomy = (id: string) => {
    if (isLoading) return;
    setState((prev) => {
      const current = prev.favoriteAnatomy || [];
      const newFav = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];

      const stateToSave = {
        ...prev,
        favoriteAnatomy: newFav,
      };
      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  const saveQuizSession = (session: Omit<QuizSession, 'id' | 'timestamp'>) => {
    if (isLoading) return;
    setState((prev) => {
      const history = prev.quizHistory || [];
      const newSession: QuizSession = {
        ...session,
        id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
      };
      const updatedHistory = [...history, newSession];
      const stateToSave = {
        ...prev,
        quizHistory: updatedHistory,
      };
      localStorage.setItem('clinicaliq_state', JSON.stringify(stateToSave));
      return stateToSave;
    });
  };

  return (
    <PhysioContext.Provider value={{
      completedMuscles: state.completedMuscles,
      todayCompleted: state.todayCompleted,
      streak: state.streak,
      lastActiveDate: state.lastActiveDate,
      xp: state.xp,
      muscleMastery: state.muscleMastery,
      studentName: state.studentName || 'BPT Student',
      studentAge: state.studentAge || '',
      studentCourse: state.studentCourse || 'Bachelor of Physiotherapy',
      studentYear: state.studentYear || '1st Year',
      studentInstitution: state.studentInstitution || '',
      learnedAnatomy: state.learnedAnatomy || [],
      favoriteAnatomy: state.favoriteAnatomy || [],
      quizHistory: state.quizHistory || [],
      markAsLearned,
      resetProgress,
      isLoading,
      addXp,
      updateMastery,
      completeMusclePuzzle,
      updateProfile,
      toggleLearnedAnatomy,
      toggleFavoriteAnatomy,
      saveQuizSession
    }}>
      {children}
    </PhysioContext.Provider>
  );
}

export function usePhysio() {
  const context = useContext(PhysioContext);
  if (!context) {
    throw new Error('usePhysio must be used within a PhysioProvider');
  }
  return context;
}
