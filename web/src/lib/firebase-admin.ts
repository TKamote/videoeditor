import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // During build, credentials might not be available
  // We'll skip initialization and let it fail at runtime if actually missing
  if (!projectId || !clientEmail || !privateKey) {
    // Check if we're in a build phase (Next.js build process)
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                         process.env.NEXT_PHASE === 'phase-development-build' ||
                         (typeof process.env.NEXT_RUNTIME === 'undefined' && process.env.NODE_ENV === 'production');
    
    if (isBuildPhase) {
      // During build, return a placeholder app that will be re-initialized at runtime
      // This allows the build to complete successfully
      // We'll use a try-catch in the API routes to handle missing credentials at runtime
      throw new Error('BUILD_TIME_PLACEHOLDER');
    }
    
    throw new Error('Firebase Admin credentials are missing. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
  }

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return adminApp;
  } catch (error) {
    console.error("Firebase admin initialization error", error);
    throw error;
  }
}

// Lazy initialization using getters
let _adminDb: admin.firestore.Firestore | null = null;
let _adminStorage: admin.storage.Storage | null = null;
let _adminAuth: admin.auth.Auth | null = null;

function getAdminDb(): admin.firestore.Firestore {
  if (!_adminDb) {
    try {
      _adminDb = getAdminApp().firestore();
    } catch (error: any) {
      // During build, if initialization fails, return a placeholder
      if (error.message === 'BUILD_TIME_PLACEHOLDER') {
        // Return a proxy that will be re-initialized at runtime
        return new Proxy({} as admin.firestore.Firestore, {
          get(_target, prop) {
            // At runtime, try to initialize again
            try {
              _adminDb = getAdminApp().firestore();
              const value = _adminDb[prop as keyof admin.firestore.Firestore];
              return typeof value === 'function' ? value.bind(_adminDb) : value;
            } catch (runtimeError) {
              throw new Error('Firebase Admin not initialized. Please check your environment variables.');
            }
          },
        });
      }
      throw error;
    }
  }
  return _adminDb;
}

function getAdminStorage(): admin.storage.Storage {
  if (!_adminStorage) {
    try {
      _adminStorage = getAdminApp().storage();
    } catch (error: any) {
      if (error.message === 'BUILD_TIME_PLACEHOLDER') {
        return new Proxy({} as admin.storage.Storage, {
          get(_target, prop) {
            try {
              _adminStorage = getAdminApp().storage();
              const value = _adminStorage[prop as keyof admin.storage.Storage];
              return typeof value === 'function' ? value.bind(_adminStorage) : value;
            } catch (runtimeError) {
              throw new Error('Firebase Admin not initialized. Please check your environment variables.');
            }
          },
        });
      }
      throw error;
    }
  }
  return _adminStorage;
}

function getAdminAuth(): admin.auth.Auth {
  if (!_adminAuth) {
    try {
      _adminAuth = getAdminApp().auth();
    } catch (error: any) {
      if (error.message === 'BUILD_TIME_PLACEHOLDER') {
        return new Proxy({} as admin.auth.Auth, {
          get(_target, prop) {
            try {
              _adminAuth = getAdminApp().auth();
              const value = _adminAuth[prop as keyof admin.auth.Auth];
              return typeof value === 'function' ? value.bind(_adminAuth) : value;
            } catch (runtimeError) {
              throw new Error('Firebase Admin not initialized. Please check your environment variables.');
            }
          },
        });
      }
      throw error;
    }
  }
  return _adminAuth;
}

// Export as getters that are called when accessed
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    const value = db[prop as keyof admin.firestore.Firestore];
    return typeof value === 'function' ? value.bind(db) : value;
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop) {
    const storage = getAdminStorage();
    const value = storage[prop as keyof admin.storage.Storage];
    return typeof value === 'function' ? value.bind(storage) : value;
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    const value = auth[prop as keyof admin.auth.Auth];
    return typeof value === 'function' ? value.bind(auth) : value;
  },
});

