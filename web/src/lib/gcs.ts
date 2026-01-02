import { Storage, Bucket } from "@google-cloud/storage";

let _storage: Storage | null = null;
let _gcsBucket: Bucket | null = null;

function getStorage(): Storage {
  if (!_storage) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n");

    // During build, credentials might not be available
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                         process.env.NEXT_PHASE === 'phase-development-build';

    if (isBuildPhase && (!projectId || !clientEmail || !privateKey)) {
      // During build, throw a placeholder error
      throw new Error('BUILD_TIME_PLACEHOLDER');
    }

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Google Cloud Storage credentials are missing. Please set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_CLIENT_EMAIL, and GOOGLE_CLOUD_PRIVATE_KEY environment variables.');
    }

    try {
      _storage = new Storage({
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
      });
    } catch (error: any) {
      if (isBuildPhase) {
        throw new Error('BUILD_TIME_PLACEHOLDER');
      }
      throw error;
    }
  }
  return _storage;
}

function getGcsBucket(): Bucket {
  if (!_gcsBucket) {
    const bucketName = process.env.GCS_BUCKET_NAME;

    // Check if bucket name is missing or empty
    if (!bucketName || bucketName.trim() === '') {
      const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                           process.env.NEXT_PHASE === 'phase-development-build';
      
      if (isBuildPhase) {
        throw new Error('BUILD_TIME_PLACEHOLDER');
      }
      
      throw new Error('GCS_BUCKET_NAME environment variable is required.');
    }

    const storage = getStorage();
    _gcsBucket = storage.bucket(bucketName);
  }
  return _gcsBucket;
}

// Export as a proxy that lazily initializes
export const gcsBucket = new Proxy({} as Bucket, {
  get(_target, prop) {
    try {
      const bucket = getGcsBucket();
      const value = bucket[prop as keyof Bucket];
      return typeof value === 'function' ? value.bind(bucket) : value;
    } catch (error: any) {
      if (error.message === 'BUILD_TIME_PLACEHOLDER') {
        // During build, return a proxy that will be re-initialized at runtime
        return new Proxy({} as Bucket, {
          get(_target, prop) {
            // At runtime, try to initialize again
            try {
              _gcsBucket = null; // Reset to force re-initialization
              const bucket = getGcsBucket();
              const value = bucket[prop as keyof Bucket];
              return typeof value === 'function' ? value.bind(bucket) : value;
            } catch (runtimeError) {
              throw new Error('GCS bucket not initialized. Please check your environment variables.');
            }
          },
        })[prop as keyof Bucket];
      }
      throw error;
    }
  },
});

export async function uploadToGCS(filePath: string, destination: string) {
  await gcsBucket.upload(filePath, {
    destination,
  });
  return `gs://${gcsBucket.name}/${destination}`;
}

export async function getSignedUrl(gcsPath: string) {
  const fileName = gcsPath.replace(`gs://${gcsBucket.name}/`, "");
  const [url] = await gcsBucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  return url;
}

