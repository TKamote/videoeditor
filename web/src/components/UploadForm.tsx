"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/auth';

export default function UploadForm() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!db) {
      setError('Database is not available.');
      return;
    }

    if (!user?.uid) {
      setError('Please log in to upload files.');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Upload via API route to avoid CORS issues
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Save metadata to Firestore
      await addDoc(collection(db, 'streams'), {
        fileName: file.name,
        firebasePath: data.firebasePath,
        downloadUrl: data.downloadURL,
        status: 'uploaded',
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      setUploading(false);
      setFile(null);
      setProgress(0);
      alert('Upload successful! Click "Process AI" to start analysis.');
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error.message}`);
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 md:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
      <h2 className="text-lg md:text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 dark:from-indigo-400 dark:via-purple-400 dark:to-purple-500 bg-clip-text text-transparent">
        Upload Stream Recording
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      <input
        type="file"
        accept="video/mp4,video/x-m4v,video/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
      />
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold ${
            uploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
          } transition-all`}
        >
          {uploading ? `Uploading... ${Math.round(progress)}%` : 'Start Upload'}
        </button>
      )}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

