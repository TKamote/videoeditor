import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { analyzeVideoHighlights } from '@/lib/gemini';
import { trackUsage } from '@/lib/usage';

const videoClient = new VideoIntelligenceServiceClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get('streamId');

  if (!streamId) {
    return NextResponse.json({ error: 'Stream ID required' }, { status: 400 });
  }

  try {
    const streamRef = adminDb.collection('streams').doc(streamId);
    const streamDoc = await streamRef.get();
    const streamData = streamDoc.data();

    if (!streamData?.viOperationName) {
      return NextResponse.json({ status: streamData?.status || 'unknown' });
    }

    // Check Video Intelligence operation status
    let operation: any;
    try {
      const result = await videoClient.checkAnnotateVideoProgress(streamData.viOperationName) as any;
      operation = Array.isArray(result) ? result[0] : result;
    } catch (viError: any) {
      console.error('Error checking Video Intelligence status:', viError);
      await streamRef.update({ 
        status: 'error', 
        error: `Video Intelligence API error: ${viError.message}` 
      });
      return NextResponse.json({ 
        status: 'error', 
        error: `Failed to check video analysis status: ${viError.message}` 
      }, { status: 500 });
    }

    if (!operation) {
      await streamRef.update({ 
        status: 'error', 
        error: 'Video Intelligence operation not found' 
      });
      return NextResponse.json({ status: 'error', error: 'Operation not found' }, { status: 404 });
    }

    if (operation.done) {
      const results = operation.result?.annotationResults?.[0];
      
      if (!results) {
        await streamRef.update({ 
          status: 'error', 
          error: 'Video Intelligence returned no results' 
        });
        return NextResponse.json({ status: 'error', error: 'No analysis results' }, { status: 500 });
      }
      
      // If we haven't run Gemini yet, do it now
      if (streamData.status === 'processing') {
        await streamRef.update({ status: 'analyzing' });

        try {
          const highlights = await analyzeVideoHighlights(results, "Find the most exciting billiard shots and reactions.");
          
          if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
            await streamRef.update({ 
              status: 'error', 
              error: 'Gemini did not return any highlights' 
            });
            return NextResponse.json({ 
              status: 'error', 
              error: 'No highlights found in video' 
            });
          }
          
          // Save clips to Firestore
          const clipsBatch = adminDb.batch();
          highlights.forEach((h: any) => {
            const clipRef = adminDb.collection('clips').doc();
            clipsBatch.set(clipRef, {
              ...h,
              streamId,
              status: 'suggested',
              createdAt: Date.now(),
            });
          });
          
          await clipsBatch.commit();
          
          // Track usage (minutes)
          const durationSeconds = results.segment?.endTimeOffset?.seconds || 0;
          const durationMinutes = Math.ceil(durationSeconds / 60);
          await trackUsage(streamData.userId || 'system', durationMinutes);

          await streamRef.update({ 
            status: 'analyzed',
            duration: durationSeconds
          });
          
          return NextResponse.json({ status: 'analyzed', clips: highlights });
        } catch (geminiError: any) {
          console.error('Gemini analysis error:', geminiError);
          await streamRef.update({ 
            status: 'error', 
            error: `Gemini analysis failed: ${geminiError.message}` 
          });
          return NextResponse.json({ 
            status: 'error', 
            error: `AI analysis failed: ${geminiError.message}` 
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ status: 'analyzed' });
    }

    // Check if operation has an error
    if (operation.error) {
      await streamRef.update({ 
        status: 'error', 
        error: `Video Intelligence error: ${operation.error.message || 'Unknown error'}` 
      });
      return NextResponse.json({ 
        status: 'error', 
        error: operation.error.message || 'Video analysis failed' 
      });
    }

    return NextResponse.json({ 
      status: 'processing', 
      progress: operation.metadata?.progressPercentage 
    });

  } catch (error: any) {
    console.error('Error checking status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

