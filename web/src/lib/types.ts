export interface Stream {
  id: string;
  userId: string;
  fileName: string;
  gcsPath: string;
  status: 'uploading' | 'processing' | 'analyzed' | 'rendering' | 'completed' | 'error';
  createdAt: number;
  duration?: number;
  metadata?: any;
}

export interface Clip {
  id: string;
  streamId: string;
  startTime: number;
  endTime: number;
  description: string;
  importance: number;
  status: 'suggested' | 'approved' | 'rejected' | 'rendering' | 'completed' | 'error';
  gcsPath?: string;
  downloadUrl?: string;
  createdAt: number;
}

export interface UserUsage {
  userId: string;
  totalMinutesProcessed: number;
  totalClipsGenerated: number;
  lastUpdated: number;
}

