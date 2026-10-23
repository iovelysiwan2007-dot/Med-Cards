'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'hi' | 'hinglish';

export const translations = {
  en: {
    appName: "ClinicalIQ",
    tagline: "Learn. Solve. Master.",
    onboardingTitle: "Master High-Yield Anatomy",
    onboardingSubTitle: "Your daily medical companion for MBBS, BPT, and Nursing.",
    getStarted: "Get Started",
    next: "Next",
    skip: "Skip",
    startQuiz: "Start Quiz",
    submit: "Submit",
    profile: "Profile",
    dashboard: "Dashboard",
    settings: "Settings",
    origin: "Origin",
    insertion: "Insertion",
    innervation: "Innervation",
    action: "Action",
    clinicalNotes: "Clinical Notes",
    streak: "Streak",
    studied: "Studied",
    mastery: "Mastery",
    theme: "Theme Mode",
    language: "Language / भाषा",
    todaysChallenge: "Today's Anatomy Challenge",
    muscleDescription: "Learn origin, insertion, action, and innervation of high-yield muscles.",
    backToDashboard: "Back to Dashboard",
    selectStream: "Select Your Medical Stream",
    personalInfo: "Personal Information",
    support: "Help & Support",
    goals: "Daily Learning Goals",
    saveSettings: "Save Settings",
    logout: "Log Out",
    welcome: "Welcome",
    quickQuiz: "Quick Quiz",
    correct: "Correct!",
    incorrect: "Incorrect!",
    score: "Score",
    anatomy: "Anatomy",
    clinicalLab: "Clinical Lab",
    playQuiz: "Play Quiz",
    loading: "Loading ClinicalIQ...",
    searchMuscles: "Search muscles...",
    filterAll: "All Muscles",
    completed: "Completed",
    notCompleted: "Not Studied",
    favorite: "Favorites",
    clickToReveal: "Click card to reveal details",
    studyDoneHeader: "You are all set for today! 🎉",
    studyDoneSub: "Come back tomorrow for new cards or revise current anatomy.",
    startStudying: "Start Studying",
    keepGoing: "Keep Going",
    soundEffects: "Sound Effects",
    pushNotifications: "Push Notifications",
    reminderTime: "Reminder Time",
    savedMsg: "Settings saved successfully!",
    confirmLogout: "Are you sure you want to log out and restart the Onboarding and Auth demo?",
    clinicalSupport: "Clinical Support Query",
    technicalSupport: "Technical/App Issue",
    academicFeedback: "Academic Feedback",
    typeYourMessage: "Type your query or feedback here...",
    messageSent: "Thank you! Your query has been logged in our system. Our medical mentors will reach out to you.",
    enterDeleteToConfirm: "Type \"delete\" to confirm account reset",
    resetAccount: "Delete & Reset Account",
    welcomeTitle: "Welcome to ClinicalIQ",
    welcomeSubtitle: "Your intelligent clinical learning companion.",
    welcomeProse: "Learn anatomy. Strengthen recall. Practice clinical reasoning. Build confidence.",
    alreadyHaveAccount: "I already have an account",
    onbLearnTitle: "Build Strong Foundations",
    onbLearnDesc: "Learn anatomy and essential clinical concepts through structured, bite-sized study.",
    onbRecallTitle: "Remember What You Learn",
    onbRecallDesc: "Use active recall and smart flashcards to strengthen long-term memory.",
    onbReasonTitle: "Think Clinically",
    onbReasonDesc: "Practice cases, clinical reasoning, and decision-making through interactive learning.",
    onbMasterTitle: "Turn Knowledge Into Confidence",
    onbMasterDesc: "Track your progress, review weak areas, and build consistent study habits.",
    startLearning: "Start Learning 🚀",
  },
  hi: {
    appName: "ClinicalIQ",
    tagline: "सीखें। हल करें। महारत हासिल करें।",
    onboardingTitle: "हाई-यील्ड एनाटॉमी मास्टर करें",
    onboardingSubTitle: "MBBS, BPT और नर्सिंग के लिए आपका दैनिक मेडिकल रिवीजन साथी।",
    getStarted: "शुरू करें",
    next: "आगे बढ़ें",
    skip: "छोड़ें",
    startQuiz: "क्विज शुरू करें",
    submit: "जमा करें",
    profile: "प्रोफ़ाइल",
    dashboard: "डैशबोर्ड",
    settings: "सेटिंग्स",
    origin: "ओरिजिन (Origin)",
    insertion: "इंसर्शन (Insertion)",
    innervation: "इनर्वेशन (Innervation)",
    action: "एक्शन (Action)",
    clinicalNotes: "क्लिनिकल नोट्स",
    streak: "दैनिक क्रम (Streak)",
    studied: "अध्ययन किया",
    mastery: "निपुणता (Mastery)",
    theme: "थीम",
    language: "भाषा",
    todaysChallenge: "आज की एनाटॉमी चुनौती",
    muscleDescription: "हाई-यील्ड मांसपेशियों के ओरिजिन, इंसर्शन, एक्शन और इनर्वेशन को सीखें।",
    backToDashboard: "डैशबोर्ड पर वापस",
    selectStream: "अपना मेडिकल स्ट्रीम चुनें",
    personalInfo: "व्यक्तिगत जानकारी",
    support: "सहायता और सहायता",
    goals: "दैनिक सीखने के लक्ष्य",
    saveSettings: "सेटिंग्स सहेजें",
    logout: "लॉग आउट",
    welcome: "स्वागत है",
    quickQuiz: "क्विक क्विज",
    correct: "सही!",
    incorrect: "गलत!",
    score: "स्कोर",
    anatomy: "एनाटॉमी",
    clinicalLab: "क्लिनिकल लैब",
    playQuiz: "क्विज खेलें",
    loading: "ClinicalIQ लोड हो रहा है...",
    searchMuscles: "मांसपेशियों की खोज करें...",
    filterAll: "सभी मांसपेशियां",
    completed: "पूर्ण",
    notCompleted: "अपूर्ण",
    favorite: "पसंदीदा",
    clickToReveal: "विवरण देखने के लिए कार्ड पर क्लिक करें",
    studyDoneHeader: "आज के लिए आपका काम हो गया! 🎉",
    studyDoneSub: "नए कार्ड्स के लिए कल वापस आएं या वर्तमान एनाटॉमी का अभ्यास करें।",
    startStudying: "पढ़ना शुरू करें",
    keepGoing: "जारी रखें",
    soundEffects: "ध्वनि प्रभाव (Sounds)",
    pushNotifications: "पुश नोटिफिकेशन",
    reminderTime: "स्मरण समय",
    savedMsg: "सेटिंग्स सफलतापूर्वक सहेजी गईं!",
    confirmLogout: "क्या आप वाकई लॉग आउट करना चाहते हैं और ऑनबोर्डिंग फिर से शुरू करना चाहते हैं?",
    clinicalSupport: "चिकित्सीय सहायता प्रश्न",
    technicalSupport: "तकनीकी/ऐप समस्या",
    academicFeedback: "अकादमिक प्रतिक्रिया",
    typeYourMessage: "अपना प्रश्न या प्रतिक्रिया यहाँ लिखें...",
    messageSent: "धन्यवाद! आपका प्रश्न दर्ज कर लिया गया है। हमारे मेडिकल गुरु जल्द ही आपसे संपर्क करेंगे।",
    enterDeleteToConfirm: "पुष्टि के लिए \"delete\" टाइप करें",
    resetAccount: "खाता हटाएं और रीसेट करें",
    welcomeTitle: "ClinicalIQ में आपका स्वागत है",
    welcomeSubtitle: "आपका बुद्धिमान नैदानिक ​​सीखने का साथी।",
    welcomeProse: "एनाटॉमी सीखें। रिकॉल को मजबूत करें। क्लिनिकल रीजनिंग का अभ्यास करें। आत्मविश्वास बनाएं।",
    alreadyHaveAccount: "मेरे पास पहले से एक खाता है",
    onbLearnTitle: "मजबूत नींव बनाएं",
    onbLearnDesc: "व्यवस्थित, छोटे आकार के अध्ययन के माध्यम से शरीर रचना विज्ञान और आवश्यक नैदानिक ​​अवधारणाओं को सीखें।",
    onbRecallTitle: "जो आप सीखते हैं उसे याद रखें",
    onbRecallDesc: "दीर्घकालिक स्मृति को मजबूत करने के लिए सक्रिय रिकॉल और स्मार्ट फ्लैशकार्ड का उपयोग करें।",
    onbReasonTitle: "क्लिनिकली सोचें",
    onbReasonDesc: "इंटरैक्टिव लर्निंग के माध्यम से मामलों, नैदानिक ​​तर्क और निर्णय लेने का अभ्यास करें।",
    onbMasterTitle: "ज्ञान को आत्मविश्वास में बदलें",
    onbMasterDesc: "अपनी प्रगति को ट्रैक करें, कमजोर क्षेत्रों की समीक्षा करें और निरंतर अध्ययन की आदतें बनाएं।",
    startLearning: "सीखना शुरू करें 🚀",
  },
  hinglish: {
    appName: "ClinicalIQ",
    tagline: "Learn karo. Solve karo. Master bano.",
    onboardingTitle: "High-Yield Anatomy Master Karo",
    onboardingSubTitle: "MBBS, BPT aur Nursing ke liye aapka daily medical companion.",
    getStarted: "Shuru Karein",
    next: "Aage Badhein",
    skip: "Skip Karein",
    startQuiz: "Quiz Start Karein",
    submit: "Submit Karein",
    profile: "Profile",
    dashboard: "Dashboard",
    settings: "Settings",
    origin: "Origin (Kahan se shuru hoti hai)",
    insertion: "Insertion (Kahan judti hai)",
    innervation: "Innervation (Nerve supply kahan se hai)",
    action: "Action (Kya kaam karti hai)",
    clinicalNotes: "Clinical Notes (Bimari/Injuries ke baare me)",
    streak: "Daily Streak 🔥",
    studied: "Kitna Padha",
    mastery: "Mastery Level",
    theme: "Theme Mode",
    language: "Bhasha (Language)",
    todaysChallenge: "Aaj ka Anatomy Challenge",
    muscleDescription: "High-yield muscles ke origin, insertion, action aur innervation ko aasan bhasha me samjhein.",
    backToDashboard: "Dashboard pe wapas",
    selectStream: "Apna Medical Stream Select Karein",
    personalInfo: "Personal Information",
    support: "Help & Support",
    goals: "Daily Learning Goals",
    saveSettings: "Settings Save Karein",
    logout: "Log Out Karein",
    welcome: "Welcome Ji",
    quickQuiz: "Quick Quiz",
    correct: "Sahi Jawab! 👍",
    incorrect: "Galat Jawab! ❌",
    score: "Score",
    anatomy: "Anatomy",
    clinicalLab: "Clinical Lab",
    playQuiz: "Quiz Khelein",
    loading: "ClinicalIQ load ho raha hai...",
    searchMuscles: "Muscle search karein...",
    filterAll: "Sari Muscles",
    completed: "Pura ho gaya",
    notCompleted: "Nahi padha abhi",
    favorite: "Favorites ❤️",
    clickToReveal: "Details dekhne ke liye card par click karein",
    studyDoneHeader: "Aaj ka quota pura ho gaya! 🎉",
    studyDoneSub: "Kal naye cards ke liye aana ya fir purane cards revise karna.",
    startStudying: "Padhai Shuru Karein",
    keepGoing: "Keep Going",
    soundEffects: "Sound Effects (Aawaz)",
    pushNotifications: "Push Notifications",
    reminderTime: "Reminder Ka Time",
    savedMsg: "Settings save ho gayi hain!",
    confirmLogout: "Kya aap sach me log out karke onboarding dobara start karna chahte hain?",
    clinicalSupport: "Medical/Clinical Doubt",
    technicalSupport: "App me koi problem/Technical Issue",
    academicFeedback: "Syllabus/Academic Feedback",
    typeYourMessage: "Apna question ya feedback yahan likhein...",
    messageSent: "Shukriya! Aapka doubt register ho gaya hai. Hamare medical mentors jald hi contact karenge.",
    enterDeleteToConfirm: "Confirm karne ke liye \"delete\" likhein",
    resetAccount: "Account Delete & Reset Karein",
    welcomeTitle: "Welcome to ClinicalIQ",
    welcomeSubtitle: "Aapka intelligent clinical learning companion.",
    welcomeProse: "Anatomy seekhein. Recall strong karein. Clinical reasoning practice karein. Confidence banayein.",
    alreadyHaveAccount: "Mera account pehle se hai",
    onbLearnTitle: "Build Strong Foundations",
    onbLearnDesc: "Structured, bite-sized study se anatomy aur essential clinical concepts seekhein.",
    onbRecallTitle: "Remember What You Learn",
    onbRecallDesc: "Active recall aur smart flashcards se long-term memory strong karein.",
    onbReasonTitle: "Think Clinically",
    onbReasonDesc: "Interactive learning se cases, clinical reasoning aur decision-making practice karein.",
    onbMasterTitle: "Turn Knowledge Into Confidence",
    onbMasterDesc: "Progress track karein, weak areas review karein aur daily study habits banayein.",
    startLearning: "Start Learning 🚀",
  }
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'] | string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    // Determine initial theme on client side
    try {
      let savedTheme = localStorage.getItem('clinicaliq_theme') as Theme | null;
      if (!savedTheme) {
        savedTheme = localStorage.getItem('medcards_theme') as Theme | null;
      }
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState(savedTheme);
      } else {
        setThemeState('system');
      }
    } catch (e) {
      console.warn('Failed to access localStorage for theme:', e);
      setThemeState('system');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (targetTheme: 'light' | 'dark') => {
      if (targetTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const currentPreference = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(currentPreference);

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      applyTheme(theme);
    }

    try {
      localStorage.setItem('clinicaliq_theme', theme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage:', e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'light' : 'dark';
      }
      return prev === 'light' ? 'dark' : 'light';
    });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      let savedLang = localStorage.getItem('clinicaliq_lang') as Language | null;
      if (!savedLang) {
        savedLang = localStorage.getItem('medcards_lang') as Language | null;
      }
      if (savedLang === 'en' || savedLang === 'hi' || savedLang === 'hinglish') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.warn('Failed to access localStorage for language:', e);
      setLanguageState('en');
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('clinicaliq_lang', lang);
    } catch (e) {
      console.warn('Failed to save language in localStorage:', e);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const dict = translations[language] as Record<string, string> || translations['en'];
    const fallback = translations['en'] as Record<string, string>;
    return dict[key] || fallback[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
