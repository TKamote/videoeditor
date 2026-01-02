import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Hardcoded Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAlrn9ETzHCdY-Sq4CpofdHC8xA2KRTHpM",
  authDomain: "videoeditor-2508b.firebaseapp.com",
  projectId: "videoeditor-2508b",
  storageBucket: "videoeditor-2508b.firebasestorage.app",
  messagingSenderId: "327382458428",
  appId: "1:327382458428:web:376201dba0fd22ade32339",
  measurementId: "G-MZQ29GW9L9"
};

// Get Firebase config - using hardcoded values
function getFirebaseConfig() {
  return firebaseConfig;
}

// Initialize Firebase with proper error handling
function initializeFirebase() {
  const config = getFirebaseConfig();

  try {
    // Check if Firebase is already initialized (handles refresh/hot reload)
    const existingApps = getApps();
    let app;
    
    if (existingApps.length > 0) {
      // Use existing app instance
      app = getApp();
    } else {
      // Initialize new app
      app = initializeApp(config);
    }
    
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    return { app, auth, db, storage };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null, db: null, storage: null };
  }
}

// Initialize Firebase instance
const firebaseInstance = initializeFirebase();

// Export direct references (backward compatible)
export const app = firebaseInstance.app;
export const auth = firebaseInstance.auth;
export const db = firebaseInstance.db;
export const storage = firebaseInstance.storage;

