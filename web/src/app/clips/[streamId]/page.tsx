"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import ClipCard from '@/components/ClipCard';
import { ArrowLeft, Scissors, Play } from 'lucide-react';
import { ProtectedRoute, useAuth } from '@/lib/auth';

function ClipsReviewContent() {
  const { streamId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [clips, setClips] = useState<any[]>([]);
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!streamId) return;

    // Fetch stream info (only if user owns it)
    const fetchStream = async () => {
      if (!user || !db) return;
      const docRef = doc(db, 'streams', streamId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const streamData = docSnap.data();
        // Verify user owns this stream
        if (streamData.userId === user.uid) {
          setStream(streamData);
        } else {
          router.push('/');
        }
      }
    };
    fetchStream();

    // Subscribe to clips
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'clips'), where('streamId', '==', streamId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClips(clipsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [streamId, user, router]);

  const handleApprove = async (clipId: string) => {
    if (!db) return;
    const clipRef = doc(db, 'clips', clipId);
    await updateDoc(clipRef, { status: 'approved' });
  };

  const handleReject = async (clipId: string) => {
    if (!db) return;
    const clipRef = doc(db, 'clips', clipId);
    await updateDoc(clipRef, { status: 'rejected' });
  };

  const handleUpdateTimestamps = async (clipId: string, startTime: number, endTime: number) => {
    if (!db) return;
    const clipRef = doc(db, 'clips', clipId);
    await updateDoc(clipRef, { startTime, endTime });
  };

  const renderClips = async () => {
    const approvedClips = clips.filter(c => c.status === 'approved');
    if (approvedClips.length === 0) {
      alert("Please approve at least one clip first.");
      return;
    }

    try {
      const response = await fetch('/api/clips/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          streamId, 
          clipIds: approvedClips.map(c => c.id) 
        }),
      });
      const data = await response.json();
      if (data.error) alert(data.error);
      else alert("Rendering started! You will be notified when clips are ready.");
    } catch (error) {
      console.error("Error starting render:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Review Clips</h1>
            <p className="text-gray-500">Stream: {stream?.fileName}</p>
          </div>
          
          <button 
            onClick={renderClips}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            <Scissors className="w-5 h-5" /> Render Approved Clips
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 italic">No clips suggested for this stream.</p>
            </div>
          ) : (
            clips.filter(c => c.status !== 'rejected').map((clip) => (
              <ClipCard 
                key={clip.id} 
                clip={clip} 
                onApprove={handleApprove}
                onReject={handleReject}
                onUpdateTimestamps={handleUpdateTimestamps}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default function ClipsReview() {
  return (
    <ProtectedRoute>
      <ClipsReviewContent />
    </ProtectedRoute>
  );
}

