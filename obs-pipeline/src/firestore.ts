import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

let firestore: admin.firestore.Firestore | null = null;

function getFirestore(): admin.firestore.Firestore {
  if (!firestore) {
    // Initialize Firebase Admin if not already initialized
    if (admin.apps.length === 0) {
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID;
      const keyFilename = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT_ID environment variable is required');
      }

      if (keyFilename) {
        // Use service account key file
        admin.initializeApp({
          credential: admin.credential.cert(keyFilename),
          projectId
        });
      } else {
        // Try to use default credentials
        admin.initializeApp({
          projectId
        });
      }
    }

    firestore = admin.firestore();
  }
  return firestore;
}

interface VideoDocumentData {
  fileName: string;
  gcsPath: string;
  fileSize: number; // in bytes
  localPath: string;
}

export async function createVideoDocument(data: VideoDocumentData): Promise<string> {
  const db = getFirestore();
  
  // Generate unique video ID
  const videoId = uuidv4();
  
  // Create document data
  const documentData = {
    videoId,
    fileName: data.fileName,
    gcsPath: data.gcsPath,
    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'uploaded',
    metadata: {
      fileSize: data.fileSize,
      localPath: data.localPath,
      uploadedBy: 'obs-watcher-script'
    }
  };

  try {
    // Create document in 'videos' collection
    await db.collection('videos').doc(videoId).set(documentData);
    console.log(`📝 Created Firestore document: videos/${videoId}`);
    return videoId;
  } catch (error: any) {
    console.error(`❌ Failed to create Firestore document: ${error.message}`);
    throw new Error(`Failed to create Firestore document: ${error.message}`);
  }
}

// Optional: Update document status
export async function updateVideoStatus(
  videoId: string,
  status: string,
  additionalData?: Record<string, any>
): Promise<void> {
  const db = getFirestore();
  const updateData: any = {
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  if (additionalData) {
    Object.assign(updateData, additionalData);
  }

  try {
    await db.collection('videos').doc(videoId).update(updateData);
    console.log(`✅ Updated video ${videoId} status to: ${status}`);
  } catch (error: any) {
    console.error(`❌ Failed to update video status: ${error.message}`);
    throw error;
  }
}

