import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function trackUsage(userId: string, minutes: number, clipsCount: number = 0) {
  const usageRef = adminDb.collection('usage').doc(userId);
  
  await usageRef.set({
    userId,
    totalMinutesProcessed: FieldValue.increment(minutes),
    totalClipsGenerated: FieldValue.increment(clipsCount),
    lastUpdated: Date.now()
  }, { merge: true });
}

export async function getUsage(userId: string) {
  const doc = await adminDb.collection('usage').doc(userId).get();
  return doc.data();
}

