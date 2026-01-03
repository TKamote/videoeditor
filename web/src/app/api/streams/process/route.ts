import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, adminDb } from '@/lib/firebase-admin';
import { gcsBucket } from '@/lib/gcs';
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { protos } from '@google-cloud/video-intelligence';

// Mark as dynamic to prevent build-time analysis
export const dynamic = 'force-dynamic';

// Initialize Video Intelligence client lazily
let videoClient: VideoIntelligenceServiceClient | null = null;

function getVideoClient(): VideoIntelligenceServiceClient {
  if (!videoClient) {
    try {
      videoClient = new VideoIntelligenceServiceClient();
    } catch (error) {
      console.error('Failed to initialize Video Intelligence client:', error);
      throw new Error('Video Intelligence API client initialization failed');
    }
  }
  return videoClient;
}

export async function POST(req: NextRequest) {
  let streamId: string | undefined;
  try {
    const body = await req.json();
    streamId = body.streamId;

    if (!streamId) {
      return NextResponse.json({ error: 'streamId is required' }, { status: 400 });
    }

    const streamRef = adminDb.collection('streams').doc(streamId);
    const streamDoc = await streamRef.get();

    if (!streamDoc.exists) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const streamData = streamDoc.data();
    const firebasePath = streamData?.firebasePath;

    if (!firebasePath) {
      await streamRef.update({ status: 'error', error: 'Firebase path not found' });
      return NextResponse.json({ error: 'Firebase path not found for stream' }, { status: 400 });
    }

    try {
      // 1. Transfer from Firebase Storage to GCS
      // Firebase Storage bucket name
      const firebaseStorageBucket = 'videoeditor-2508b.firebasestorage.app';
      const firebaseBucket = adminStorage.bucket(firebaseStorageBucket);
      const firebaseFile = firebaseBucket.file(firebasePath);
      
      const gcsFileName = `streams/${streamId}_${streamData?.fileName}`;
      
      // Get bucket name from environment
      const bucketName = process.env.GCS_BUCKET_NAME;
      if (!bucketName) {
        throw new Error('GCS_BUCKET_NAME environment variable is not set');
      }
      
      // Create GCS file reference directly using Storage client
      const { Storage } = await import('@google-cloud/storage');
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
      const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Google Cloud Storage credentials are missing');
      }
      
      const storage = new Storage({
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
      });
      const gcsBucketInstance = storage.bucket(bucketName);
      const gcsFile = gcsBucketInstance.file(gcsFileName);

      console.log(`Copying from Firebase: ${firebasePath} to GCS: ${gcsFileName}`);
      console.log(`GCS bucket: ${bucketName}, file path: ${gcsFileName}`);
      console.log(`GCS file name: ${gcsFile.name}`);
      
      try {
        await firebaseFile.copy(gcsFile);
        console.log('File copy successful');
      } catch (copyError: any) {
        console.error('File copy failed:', copyError);
        throw new Error(`File copy failed: ${copyError.message}`);
      }
      const gcsUri = `gs://${bucketName}/${gcsFileName}`;

      await streamRef.update({
        status: 'processing',
        gcsPath: gcsUri,
      });

      // 2. Trigger Video Intelligence API
      const request: protos.google.cloud.videointelligence.v1.IAnnotateVideoRequest = {
        inputUri: gcsUri,
        features: [
          protos.google.cloud.videointelligence.v1.Feature.LABEL_DETECTION,
          protos.google.cloud.videointelligence.v1.Feature.SHOT_CHANGE_DETECTION,
          protos.google.cloud.videointelligence.v1.Feature.FACE_DETECTION,
        ],
      };

      let operation: any;
      try {
        console.log('Initializing Video Intelligence client...');
        const client = getVideoClient();
        console.log('Calling Video Intelligence API with URI:', gcsUri);
        // annotateVideo returns a Promise that resolves to an array
        const result = await client.annotateVideo(request) as any;
        operation = Array.isArray(result) ? result[0] : result;
        console.log('Video intelligence operation started:', operation?.name);
      } catch (viError: any) {
        console.error('Video Intelligence API error:', viError);
        await streamRef.update({ 
          status: 'error', 
          error: `Video Intelligence API failed: ${viError.message}` 
        });
        return NextResponse.json({ 
          error: 'Failed to start video analysis', 
          details: viError.message 
        }, { status: 500 });
      }

      if (!operation || !operation.name) {
        await streamRef.update({ 
          status: 'error', 
          error: 'Video Intelligence operation did not return operation name' 
        });
        return NextResponse.json({ error: 'Invalid response from Video Intelligence API' }, { status: 500 });
      }

      await streamRef.update({
        viOperationName: operation.name,
      });

      return NextResponse.json({ 
        message: 'Processing started', 
        operationName: operation.name 
      });

    } catch (transferError: any) {
      console.error('Error transferring file to GCS:', transferError);
      await streamRef.update({ 
        status: 'error', 
        error: `File transfer failed: ${transferError.message}` 
      });
      return NextResponse.json({ 
        error: 'Failed to transfer file to Google Cloud Storage', 
        details: transferError.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing stream:', error);
    console.error('Error stack:', error.stack);
    
    // Try to update stream status if we have streamId
    if (streamId) {
      try {
        const streamRef = adminDb.collection('streams').doc(streamId);
        await streamRef.update({ 
          status: 'error', 
          error: error.message || 'Unknown error occurred' 
        });
      } catch (updateError) {
        console.error('Failed to update stream status:', updateError);
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

