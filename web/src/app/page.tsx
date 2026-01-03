"use client";

import React, { useEffect, useState } from 'react';
import UploadForm from '@/components/UploadForm';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { ProtectedRoute, useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { Moon, Sun, LogOut, Sparkles } from 'lucide-react';

function HomeContent() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [streams, setStreams] = useState<any[]>([]);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !user) return;

    try {
      // Only show streams for the current user
      const q = query(
        collection(db, 'streams'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const streamsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStreams(streamsData);
      }, (error) => {
        console.error('Firestore error:', error);
        setFirebaseError(`Database error: ${error.message}. Check Firestore security rules.`);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      setFirebaseError('Failed to initialize database connection.');
    }
  }, [user]);

  const [processingError, setProcessingError] = useState<string | null>(null);

  const startProcessing = async (streamId: string) => {
    setProcessingError(null);
    try {
      const response = await fetch('/api/streams/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        // Show detailed error message
        const errorMsg = data.details 
          ? `${data.error || 'Processing error'}: ${data.details}`
          : data.error || 'Failed to start processing';
        setProcessingError(errorMsg);
        console.error("Processing error:", data);
      } else {
        // Success - refresh the page to show updated status
        window.location.reload();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to start processing';
      setProcessingError(errorMessage);
      console.error("Error starting processing:", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 lg:p-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl"></div>
        
        {/* Subtle lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-400 dark:text-gray-700"/>
        </svg>
      </div>

      {/* Header */}
      <div className="z-10 w-full max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 relative gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 dark:from-indigo-400 dark:via-purple-400 dark:to-purple-500 bg-clip-text text-transparent">
            Stream Editor AI
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center w-full md:w-auto justify-end">
          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 px-2 md:px-3 py-1.5 md:py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 truncate max-w-[150px] md:max-w-none">
            {user?.email}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm font-medium hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center gap-2 text-gray-900 dark:text-gray-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {firebaseError && (
        <div className="w-full max-w-6xl mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ {firebaseError}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
            Check your browser console for details. This is usually a Firestore security rules issue.
          </p>
        </div>
      )}
      {processingError && (
        <div className="w-full max-w-6xl mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-medium">
            ❌ Processing Error: {processingError}
          </p>
          <button
            onClick={() => setProcessingError(null)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl relative z-10">
        <div className="lg:col-span-1">
          <UploadForm />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 dark:from-indigo-400 dark:via-purple-400 dark:to-purple-500 bg-clip-text text-transparent">Your Streams</h2>
            <div className="space-y-3 md:space-y-4">
              {!firebaseError && streams.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic text-center py-8 text-sm md:text-base">No streams uploaded yet.</p>
              ) : firebaseError ? (
                <p className="text-gray-500 dark:text-gray-400 italic text-center py-8 text-sm md:text-base">Please configure Firebase to view streams.</p>
              ) : (
                streams.map((stream) => (
                  <div key={stream.id} className="p-3 md:p-4 border border-gray-100 dark:border-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100 truncate">{stream.fileName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          stream.status === 'analyzed' ? 'bg-green-100 text-green-700' :
                          stream.status === 'processing' || stream.status === 'analyzing' ? 'bg-blue-100 text-blue-700' :
                          stream.status === 'error' ? 'bg-red-100 text-red-700' :
                          stream.status === 'rendering' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {stream.status.toUpperCase()}
                        </span>
                        {stream.error && (
                          <span className="text-xs text-red-600 dark:text-red-400" title={stream.error}>
                            ⚠️ Error
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stream.createdAt?.toDate ? stream.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      {stream.status === 'uploaded' && (
                        <button 
                          onClick={() => startProcessing(stream.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          Process AI
                        </button>
                      )}
                      {stream.status === 'analyzed' && (
                        <a 
                          href={`/clips/${stream.id}`}
                          className="w-full sm:w-auto inline-block text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          Review Clips
                        </a>
                      )}
                      {(stream.status === 'processing' || stream.status === 'analyzing') && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          <span className="text-sm text-gray-500 italic">Processing...</span>
                        </div>
                      )}
                      {stream.status === 'error' && (
                        <div className="flex flex-col gap-2 items-end sm:items-start">
                          <div className="text-xs text-red-600 dark:text-red-400 max-w-xs" title={stream.error}>
                            {stream.error || 'An error occurred'}
                          </div>
                          <button 
                            onClick={async () => {
                              // Reset status to 'uploaded' to allow retry
                              try {
                                const { db } = await import('@/lib/firebase');
                                if (db) {
                                  const { doc, updateDoc } = await import('firebase/firestore');
                                  const streamRef = doc(db, 'streams', stream.id);
                                  await updateDoc(streamRef, { 
                                    status: 'uploaded',
                                    error: null 
                                  });
                                  // Then start processing
                                  startProcessing(stream.id);
                                }
                              } catch (err) {
                                console.error('Failed to reset stream status:', err);
                                // Try processing anyway
                                startProcessing(stream.id);
                              }
                            }}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-colors"
                          >
                            Retry Process AI
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
