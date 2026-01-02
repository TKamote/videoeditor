import React from 'react';
import { Clip } from '@/lib/types';
import { Play, Check, X, Scissors } from 'lucide-react';

interface ClipCardProps {
  clip: Clip;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateTimestamps: (id: string, start: number, end: number) => void;
}

export default function ClipCard({ clip, onApprove, onReject, onUpdateTimestamps }: ClipCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative group">
        <Play className="w-12 h-12 text-gray-400 group-hover:text-blue-600 transition-colors cursor-pointer" />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight">{clip.description}</h3>
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">
            Score: {clip.importance}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-4 mb-6">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Start (sec)</label>
            <input 
              type="number" 
              value={clip.startTime} 
              onChange={(e) => onUpdateTimestamps(clip.id, Number(e.target.value), clip.endTime)}
              className="w-full text-sm border-b border-gray-300 dark:border-gray-600 bg-transparent py-1 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">End (sec)</label>
            <input 
              type="number" 
              value={clip.endTime} 
              onChange={(e) => onUpdateTimestamps(clip.id, clip.startTime, Number(e.target.value))}
              className="w-full text-sm border-b border-gray-300 dark:border-gray-600 bg-transparent py-1 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {clip.status === 'suggested' && (
            <>
              <button 
                onClick={() => onApprove(clip.id)}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button 
                onClick={() => onReject(clip.id)}
                className="py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 rounded-lg text-sm font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {clip.status === 'approved' && (
            <div className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Ready to Render
            </div>
          )}
          {clip.status === 'rendering' && (
            <div className="w-full py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-700"></div>
              Rendering...
            </div>
          )}
          {clip.status === 'completed' && (
            <a 
              href={clip.downloadUrl}
              download
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Download Clip
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

