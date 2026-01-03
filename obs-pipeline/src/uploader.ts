import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs/promises';

let storage: Storage | null = null;
let bucketName: string | null = null;

function getStorage(): Storage {
  if (!storage) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
    }

    if (keyFilename) {
      // Use service account key file
      storage = new Storage({
        projectId,
        keyFilename
      });
    } else {
      // Try to use default credentials (gcloud auth application-default login)
      storage = new Storage({
        projectId
      });
    }
  }
  return storage;
}

function getBucketName(): string {
  if (!bucketName) {
    bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME environment variable is required');
    }
  }
  return bucketName;
}

export async function uploadVideoToGCS(
  localFilePath: string,
  fileName: string
): Promise<string> {
  const storage = getStorage();
  const bucket = storage.bucket(getBucketName());
  
  // Create destination path: videos/{fileName}
  const destination = `videos/${fileName}`;
  
  console.log(`📤 Uploading ${fileName} to gs://${getBucketName()}/${destination}...`);

  try {
    // Upload file with metadata
    await bucket.upload(localFilePath, {
      destination,
      metadata: {
        contentType: getContentType(fileName),
        metadata: {
          uploadedBy: 'obs-watcher-script',
          uploadedAt: new Date().toISOString(),
          originalFileName: fileName
        }
      }
    });

    const gcsPath = `gs://${getBucketName()}/${destination}`;
    console.log(`✅ Upload successful: ${gcsPath}`);
    
    return gcsPath;
  } catch (error: any) {
    console.error(`❌ Upload failed: ${error.message}`);
    throw new Error(`Failed to upload ${fileName}: ${error.message}`);
  }
}

function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Optional: Check if file exists in GCS
export async function fileExistsInGCS(fileName: string): Promise<boolean> {
  try {
    const storage = getStorage();
    const bucket = storage.bucket(getBucketName());
    const file = bucket.file(`videos/${fileName}`);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    return false;
  }
}

