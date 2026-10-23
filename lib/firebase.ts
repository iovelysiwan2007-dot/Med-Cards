import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Safe validation helpers to prevent runtime pollution from empty or stringified "undefined" env variables
const getValidApiKey = (val: string | undefined): string => {
  const fallback = "AIzaSyDC_eSL7XGb0eSlh9wfP3M3J31s3uLtyW4";
  if (!val) return fallback;
  const trimmed = val.trim();
  if (trimmed.startsWith("AIzaSy")) return trimmed;
  return fallback;
};

const getValidAuthDomain = (val: string | undefined, projectId: string): string => {
  const fallback = `${projectId}.firebaseapp.com`;
  if (!val) return fallback;
  let trimmed = val.trim();
  
  // Rule: Do NOT use firebasestorage.app for auth domain under any condition
  if (trimmed.includes("firebasestorage.app")) {
    trimmed = trimmed.replace("firebasestorage.app", "firebaseapp.com");
  }
  
  if (trimmed.includes(".com") || trimmed.includes(".app")) return trimmed;
  return fallback;
};

const getValidProjectId = (val: string | undefined): string => {
  const fallback = "plucky-nation-bwjkk";
  if (!val) return fallback;
  const trimmed = val.trim();
  if (trimmed.length > 5 && trimmed !== "undefined" && trimmed !== "null") return trimmed;
  return fallback;
};

const getValidStorageBucket = (val: string | undefined): string => {
  const fallback = "plucky-nation-bwjkk.appspot.com";
  if (!val) return fallback;
  const trimmed = val.trim();
  // Auto-convert newer unresolved .firebasestorage.app domains to standard .appspot.com to avoid DNS NXDOMAIN errors
  if (trimmed.endsWith(".firebasestorage.app")) {
    const prefix = trimmed.replace(".firebasestorage.app", "");
    return `${prefix}.appspot.com`;
  }
  if (trimmed.includes(".app") || trimmed.includes(".com")) return trimmed;
  return fallback;
};

const getValidMessagingId = (val: string | undefined): string => {
  const fallback = "1018333240342";
  if (!val) return fallback;
  const trimmed = val.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  return fallback;
};

const getValidAppId = (val: string | undefined): string => {
  const fallback = "1:1018333240342:web:d554afa263ade2af6ca937";
  if (!val) return fallback;
  const trimmed = val.trim();
  if (trimmed.startsWith("1:")) return trimmed;
  return fallback;
};

const validatedProjectId = getValidProjectId(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

const firebaseConfig = {
  apiKey: getValidApiKey(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: getValidAuthDomain(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, validatedProjectId),
  projectId: validatedProjectId,
  storageBucket: getValidStorageBucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getValidMessagingId(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: getValidAppId(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

// Initialize Firebase App
let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

const isDev = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost';

const missingKeys = [
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 'NEXT_PUBLIC_FIREBASE_API_KEY',
  !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET && 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  !process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID && 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  !process.env.NEXT_PUBLIC_FIREBASE_APP_ID && 'NEXT_PUBLIC_FIREBASE_APP_ID'
].filter(Boolean);

const hasAllKeys = missingKeys.length === 0;

if (!hasAllKeys) {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn("[MedCards Auth Error] Missing API Key");
  } else {
    console.warn(`[MedCards Auth Error] Missing Firebase variables: ${missingKeys.join(', ')}`);
  }
}

try {
  if (hasAllKeys) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    if (isDev) {
      console.log("[MedCards] Firebase initialized successfully");
    }
  } else {
    // If some environment keys are missing, we still try initialization with validated/safe fallbacks to prevent hard crash
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    if (isDev) {
      console.log("[MedCards] Firebase initialized with local fallbacks");
    }
  }
} catch (error: any) {
  console.error("[MedCards] Error initializing Firebase app:", error?.message || error);
}

try {
  if (app) {
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (error: any) {
  console.error("[MedCards Auth Error] Graceful initialization failure:", error?.message || error);
}

try {
  if (app) {
    db = getFirestore(app, "ai-studio-physiocards-f82093a5-ad53-46d2-a79d-e2f920d842c4");
  }
} catch (error: any) {
  console.error("[MedCards Firestore Error] Graceful initialization failure:", error?.message || error);
}

export { app, auth, db, googleProvider };
