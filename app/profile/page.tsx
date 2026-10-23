'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  User, 
  Target, 
  Bookmark, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Trash2, 
  Bell, 
  Clock, 
  Sparkles, 
  Check, 
  BookOpen, 
  Award, 
  ShieldAlert, 
  Edit3, 
  Send,
  Sliders,
  CheckCircle2,
  Lock,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  Heart
} from 'lucide-react';
import { usePhysio } from '../../context/PhysioContext';
import { motion, AnimatePresence } from 'motion/react';
import { muscles } from '../../data/muscles';
import Navigation from '../../components/Navigation';
import ThemeLangSelector from '../../components/ThemeLangSelector';
import { useLanguage } from '../../context/ThemeLanguageContext';

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { 
    completedMuscles, 
    streak, 
    xp, 
    studentName, 
    studentAge, 
    studentCourse, 
    studentYear, 
    studentInstitution,
    favoriteAnatomy,
    toggleFavoriteAnatomy,
    updateProfile,
    resetProgress,
    muscleMastery,
    learnedAnatomy
  } = usePhysio();

  // Active Menu Tabs
  const [activeTab, setActiveTab] = useState<'none' | 'personal' | 'goals' | 'bookmarks' | 'settings' | 'help'>('none');

  // Personal Info Form State
  const [nameInput, setNameInput] = useState(studentName);
  const [courseInput, setCourseInput] = useState(studentCourse);
  const [yearInput, setYearInput] = useState(studentYear);
  const [ageInput, setAgeInput] = useState(studentAge);
  const [instInput, setInstInput] = useState(studentInstitution);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Daily Learning Goals State
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState<number>(5);
  const [goalFeedback, setGoalFeedback] = useState('');

  // App Settings State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [spacedRepetitionHour, setSpacedRepetitionHour] = useState<string>('09:00');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Help & Support Form
  const [supportCategory, setSupportCategory] = useState('clinical');
  const [supportText, setSupportText] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Logout & Delete Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Hydrate local parameters
  useEffect(() => {
    const timer = setTimeout(() => {
      setNameInput(studentName);
      setCourseInput(studentCourse);
      setYearInput(studentYear);
      setAgeInput(studentAge);
      setInstInput(studentInstitution);

      // Load custom states
      let savedGoal = localStorage.getItem('clinicaliq_goal_minutes');
      if (!savedGoal) savedGoal = localStorage.getItem('medcards_goal_minutes');
      if (savedGoal) setDailyTargetMinutes(Number(savedGoal));

      let savedSound = localStorage.getItem('clinicaliq_sound_enabled');
      if (!savedSound) savedSound = localStorage.getItem('medcards_sound_enabled');
      if (savedSound) setSoundEnabled(savedSound === 'true');

      let savedNotif = localStorage.getItem('clinicaliq_notifications_enabled');
      if (!savedNotif) savedNotif = localStorage.getItem('medcards_notifications_enabled');
      if (savedNotif) setNotificationsEnabled(savedNotif === 'true');

      let savedHour = localStorage.getItem('clinicaliq_spaced_rep_hour');
      if (!savedHour) savedHour = localStorage.getItem('medcards_spaced_rep_hour');
      if (savedHour) setSpacedRepetitionHour(savedHour);
    }, 0);

    return () => clearTimeout(timer);
  }, [studentName, studentCourse, studentYear, studentAge, studentInstitution]);

  // Actions
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(nameInput, ageInput, courseInput, yearInput, instInput);
    setProfileSuccessMsg('Profile updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleSaveGoal = () => {
    localStorage.setItem('clinicaliq_goal_minutes', String(dailyTargetMinutes));
    setGoalFeedback(`Goal set to ${dailyTargetMinutes} minutes per day! 🎯`);
    setTimeout(() => setGoalFeedback(''), 3000);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('clinicaliq_sound_enabled', String(soundEnabled));
    localStorage.setItem('clinicaliq_notifications_enabled', String(notificationsEnabled));
    localStorage.setItem('clinicaliq_spaced_rep_hour', spacedRepetitionHour);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    setSupportSuccess(true);
    setSupportText('');
    setTimeout(() => setSupportSuccess(false), 4000);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('clinicaliq_logged_in');
    localStorage.removeItem('clinicaliq_onboarded');
    localStorage.removeItem('clinicaliq_username');
    localStorage.removeItem('clinicaliq_stream');
    localStorage.removeItem('medcards_logged_in');
    localStorage.removeItem('medcards_onboarded');
    localStorage.removeItem('medcards_username');
    localStorage.removeItem('medcards_stream');
    resetProgress();
    setIsLogoutModalOpen(false);
    window.location.href = '/';
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      localStorage.clear();
      resetProgress();
      setIsDeleteModalOpen(false);
      window.location.href = '/';
    } else {
      alert('Please type "delete" to confirm.');
    }
  };

  // Derived metrics
  const cardsStudied = completedMuscles.length; 
  const calculateAverageMastery = () => {
    if (!muscleMastery) return null;
    const keys = Object.keys(muscleMastery);
    if (keys.length === 0) return null;
    const sum = keys.reduce((acc, k) => acc + (muscleMastery[k] || 0), 0);
    return Math.round(sum / keys.length);
  };
  const averageMastery = calculateAverageMastery();

  return (
    <div className="h-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-900 pb-4 text-slate-800 dark:text-slate-100 font-sans selection:bg-teal-100 relative w-full flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-3 px-3 sticky top-0 z-40 shadow-xs">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100/50 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer"
            id="btn-back-to-dashboard"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight" id="profile-page-title">
            My Profile
          </h2>

          <div className="w-9 h-9" /> {/* Spacer to center the header */}
        </div>
      </header>

      <main className="w-full px-4 pt-4 space-y-4">

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-5 relative overflow-hidden" id="profile-header-card">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-indigo-600" />
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-teal-600 font-black text-2xl shadow-inner shrink-0">
              {studentName ? studentName.charAt(0).toUpperCase() : 'MD'}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight" id="profile-full-name">
                {studentName || 'Dr. Medical Student'}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100/50" id="profile-stream-badge">
                  {studentCourse || 'MBBS Student'}
                </span>
                {studentYear && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-1 rounded-full border border-slate-100">
                    {studentYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Overview Grid */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/60 text-center space-y-0.5">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Studied</span>
              <p className="text-base font-black text-slate-800" id="stat-cards-studied">{cardsStudied} muscles</p>
            </div>

            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/60 text-center space-y-0.5">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Streak</span>
              <p className="text-base font-black text-teal-600 flex items-center justify-center gap-0.5" id="stat-quiz-streak">
                {streak} Days <span className="text-xs">🔥</span>
              </p>
            </div>

            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/60 text-center space-y-0.5">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
              <p className="text-base font-black text-slate-800" id="stat-mastery-score">
                {averageMastery !== null ? `${averageMastery}%` : 'No data yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Action Menu */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-100">
          
          {/* Action Row: Personal Info */}
          <div className="flex flex-col">
            <button
              onClick={() => setActiveTab(activeTab === 'personal' ? 'none' : 'personal')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors text-left"
              id="menu-personal-info"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Personal Info</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Edit your name, medical stream, and year</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'personal' ? 'rotate-90 text-teal-600' : ''}`} />
            </button>

            <AnimatePresence>
              {activeTab === 'personal' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/30 px-5 pb-5"
                >
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-slate-100/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Stream / Track</label>
                        <select
                          value={courseInput}
                          onChange={(e) => setCourseInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                        >
                          <option value="MBBS / Clinician Core">MBBS / Clinician Core</option>
                          <option value="BPT / Physiotherapy">BPT / Physiotherapy</option>
                          <option value="Nursing & Allied Health">Nursing & Allied Health</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Academic Year</label>
                        <select
                          value={yearInput}
                          onChange={(e) => setYearInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Internship / Resident">Intern / Resident</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Age</label>
                        <input
                          type="text"
                          value={ageInput}
                          onChange={(e) => setAgeInput(e.target.value)}
                          placeholder="e.g. 23"
                          className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Institution</label>
                        <input
                          type="text"
                          value={instInput}
                          onChange={(e) => setInstInput(e.target.value)}
                          placeholder="e.g. AIMS University"
                          className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    {profileSuccessMsg && (
                      <p className="text-[11px] font-extrabold text-teal-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {profileSuccessMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save Personal Info</span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row: Learning Goals */}
          <div className="flex flex-col">
            <button
              onClick={() => setActiveTab(activeTab === 'goals' ? 'none' : 'goals')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors text-left"
              id="menu-learning-goals"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Target className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Learning Goals</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Adjust your daily study target minutes</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'goals' ? 'rotate-90 text-indigo-600' : ''}`} />
            </button>

            <AnimatePresence>
              {activeTab === 'goals' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/30 px-5 pb-5"
                >
                  <div className="space-y-4 pt-3 border-t border-slate-100/50 text-left">
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Select how many minutes of active recall study you want to accomplish every single day:
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Daily Target</span>
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
                          {dailyTargetMinutes} Mins / Day
                        </span>
                      </div>

                      <input
                        type="range"
                        min="2"
                        max="30"
                        step="1"
                        value={dailyTargetMinutes}
                        onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
                        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />

                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>2 mins (Casual)</span>
                        <span>15 mins (Standard)</span>
                        <span>30 mins (Pro)</span>
                      </div>
                    </div>

                    {goalFeedback && (
                      <p className="text-[11px] font-extrabold text-teal-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {goalFeedback}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveGoal}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Set Active Target</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row: Bookmarked Flashcards */}
          <div className="flex flex-col">
            <button
              onClick={() => setActiveTab(activeTab === 'bookmarks' ? 'none' : 'bookmarks')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors text-left"
              id="menu-bookmarks"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Bookmark className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Bookmarked Items</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Review anatomy flashcards you saved</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'bookmarks' ? 'rotate-90 text-amber-500' : ''}`} />
            </button>

            <AnimatePresence>
              {activeTab === 'bookmarks' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/30 px-5 pb-5"
                >
                  <div className="space-y-3 pt-3 border-t border-slate-100/50 text-left">
                    {favoriteAnatomy && favoriteAnatomy.length > 0 ? (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved Muscles ({favoriteAnatomy.length})</p>
                        
                        {favoriteAnatomy.map((id) => {
                          const mInfo = muscles.find(m => m.id === id);
                          return (
                            <div 
                              key={id}
                              className="bg-white border border-slate-100 p-2.5 rounded-xl flex items-center justify-between shadow-2xs"
                            >
                              <div className="space-y-0.5">
                                <h5 className="text-xs font-black text-slate-800 leading-none">{mInfo?.name || id}</h5>
                                <p className="text-[9px] font-bold text-slate-400">{mInfo?.region || 'Skeletal system'}</p>
                              </div>

                              <button
                                onClick={() => toggleFavoriteAnatomy(id)}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-slate-200/30"
                                title="Remove Bookmark"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                          <Bookmark className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-400 font-extrabold">No saved flashcards yet!</p>
                        <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-normal">
                          Bookmark high-yield anatomical muscle cards in the library to see them listed here.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row: App Settings */}
          <div className="flex flex-col">
            <button
              onClick={() => setActiveTab(activeTab === 'settings' ? 'none' : 'settings')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors text-left"
              id="menu-app-settings"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Settings className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">App Settings</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Configure sound, theme, and reminders</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'settings' ? 'rotate-90 text-purple-600' : ''}`} />
            </button>

            <AnimatePresence>
              {activeTab === 'settings' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/30 px-5 pb-5"
                >
                  <div className="space-y-4 pt-3 border-t border-slate-100/50 text-left">
                    
                    <ThemeLangSelector />
                    
                    {/* Audio Feedback Switch */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-slate-800">Interactive Sound Effects</h5>
                        <p className="text-[9px] text-slate-400 font-bold leading-none">Click chimes & answers sound feedback</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          soundEnabled ? 'bg-teal-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-xs transition-transform transform ${
                          soundEnabled ? 'translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Notification Switch */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-slate-800">Daily Study Reminders</h5>
                        <p className="text-[9px] text-slate-400 font-bold leading-none">Push alerts to maintain active streaks</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          notificationsEnabled ? 'bg-teal-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-xs transition-transform transform ${
                          notificationsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Spaced Repetition Reminders Timer */}
                    {notificationsEnabled && (
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-black text-slate-800">Smart Schedule</h5>
                            <p className="text-[9px] text-slate-400 font-bold leading-none">Spaced repetition review trigger</p>
                          </div>
                          
                          <input
                            type="time"
                            value={spacedRepetitionHour}
                            onChange={(e) => setSpacedRepetitionHour(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold outline-none text-teal-700"
                          />
                        </div>
                      </div>
                    )}

                    {settingsSaved && (
                      <p className="text-[11px] font-extrabold text-teal-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Settings saved successfully!
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Apply App Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('clinicaliq_onboarding_completed', 'false');
                        localStorage.removeItem('clinicaliq_logged_in');
                        localStorage.removeItem('clinicaliq_onboarded');
                        localStorage.removeItem('medcards_logged_in');
                        localStorage.removeItem('medcards_onboarded');
                        window.location.href = '/';
                      }}
                      className="w-full mt-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                      id="btn-replay-onboarding"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Replay Onboarding Tour</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row: Help & Support */}
          <div className="flex flex-col">
            <button
              onClick={() => setActiveTab(activeTab === 'help' ? 'none' : 'help')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors text-left"
              id="menu-help-support"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Help & Medical Content FAQ</h4>
                  <p className="text-[10px] font-semibold text-slate-400">View FAQs and submit clinical curriculum issues</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeTab === 'help' ? 'rotate-90 text-teal-600' : ''}`} />
            </button>

            <AnimatePresence>
              {activeTab === 'help' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/30 px-5 pb-5 text-left"
                >
                  <div className="space-y-4 pt-3 border-t border-slate-100/50">
                    
                    {/* Compact FAQs */}
                    <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
                      <h5 className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Frequently Asked Questions</h5>
                      
                      <div className="space-y-1.5 text-[10.5px]">
                        <div>
                          <p className="font-extrabold text-slate-800">Q: What is the source of anatomical details?</p>
                          <p className="text-slate-500 font-medium leading-relaxed">A: All muscle OIAN (Origin, Insertion, Action, Nerve) listings conform with Gray&apos;s Anatomy and clinical therapeutic standards.</p>
                        </div>
                        <div className="border-t border-slate-100 pt-1.5">
                          <p className="font-extrabold text-slate-800">Q: How does the spaced repetition review trigger?</p>
                          <p className="text-slate-500 font-medium leading-relaxed">A: Solved muscles are re-flagged in your daily challenge every 1, 3, or 7 days based on correct active recall answers.</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Form */}
                    <form onSubmit={handleSupportSubmit} className="space-y-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
                      <h5 className="text-[10px] font-black uppercase text-teal-700 tracking-wider">Submit Clinical Feedback</h5>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400">Category</label>
                        <select
                          value={supportCategory}
                          onChange={(e) => setSupportCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px] font-bold outline-none"
                        >
                          <option value="clinical">Anatomy Data Error / Content Correction</option>
                          <option value="app">App Interface Bug / Settings Glitch</option>
                          <option value="suggestion">Feature Request / Custom Study Stream</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400">Feedback Details</label>
                        <textarea
                          rows={2}
                          required
                          value={supportText}
                          onChange={(e) => setSupportText(e.target.value)}
                          placeholder="Please describe the correction or suggestion..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-medium outline-none focus:bg-white focus:border-teal-500 transition-colors"
                        />
                      </div>

                      {supportSuccess && (
                        <p className="text-[10px] font-extrabold text-teal-600">
                          ✓ Feedback securely queued. Thank you for maintaining high clinical accuracy!
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-extrabold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        <span>Send Feedback</span>
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Logout & Delete Account Actions */}
        <div className="space-y-3.5">
          {/* Logout Button */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-100 p-4 rounded-3xl flex items-center justify-between text-rose-600 transition-all shadow-xs cursor-pointer group active:scale-[0.99]"
            id="btn-logout"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                <LogOut className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black">Log Out</h4>
                <p className="text-[10px] font-semibold text-rose-400">Exit and restart onboarding session</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
          </button>

          {/* Delete Account link */}
          <div className="text-center pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-[11px] font-extrabold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-wider cursor-pointer hover:underline"
              id="link-delete-account"
            >
              Delete Account
            </button>
          </div>
        </div>

      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-5"
              id="logout-confirmation-modal"
            >
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
                <ShieldAlert className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-slate-800 leading-tight">Confirm Logout</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Are you sure you want to sign out of this active session?</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                This will safely sign out of your profile and reset your session, allowing you to re-enroll or use other credentials.
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-3 rounded-xl transition-colors shadow-xs cursor-pointer"
                  id="btn-confirm-logout"
                >
                  Yes, Log Out
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-3 rounded-xl transition-colors cursor-pointer"
                  id="btn-cancel-logout"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-5 animate-in fade-in"
              id="delete-account-modal"
            >
              <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-100/50">
                <Trash2 className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-slate-800 leading-tight">Delete Account permanently</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">This action is completely irreversible.</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-left">
                <p className="text-slate-500 font-medium leading-relaxed">
                  All studied cards, daily streaks, total XP, custom streams, and settings parameters will be permanently erased.
                </p>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Type &quot;delete&quot; to authorize</label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="delete"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-rose-600 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                  id="btn-confirm-delete"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  );
}
