import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, adminDb } from '@/lib/firebase-admin';
import { gcsBucket } from '@/lib/gcs';
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { protos } from '@google-cloud/video-intelligence';

const videoClient = new VideoIntelligenceServiceClient();

export async function POST(req: NextRequest) {
  try {
    const { streamId } = await req.json();

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
      const firebaseFile = adminStorage.bucket().file(firebasePath);
      const gcsFileName = `streams/${streamId}_${streamData?.fileName}`;
      const gcsFile = gcsBucket.file(gcsFileName);

      await firebaseFile.copy(gcsFile);
      const gcsUri = `gs://${gcsBucket.name}/${gcsFileName}`;

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
        // annotateVideo returns a Promise that resolves to an array
        const result = await videoClient.annotateVideo(request) as any;
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
    // Try to update stream status if we have streamId
    try {
      const { streamId } = await req.json();
      if (streamId) {
        const streamRef = adminDb.collection('streams').doc(streamId);
        await streamRef.update({ status: 'error', error: error.message });
      }
    } catch (updateError) {
      // Ignore update errors if we can't update
    }
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

