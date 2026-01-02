import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { trackUsage } from '@/lib/usage';

// Mark as dynamic to prevent build-time analysis
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { streamId, clipIds } = await req.json();

    if (!streamId || !clipIds || clipIds.length === 0) {
      return NextResponse.json({ error: 'Missing streamId or clipIds' }, { status: 400 });
    }

    const streamRef = adminDb.collection('streams').doc(streamId);
    const streamDoc = await streamRef.get();
    
    if (!streamDoc.exists) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }
    
    const streamData = streamDoc.data();

    // Trigger Cloud Run Worker
    const workerUrl = process.env.CLOUD_RUN_WORKER_URL;
    
    if (!workerUrl) {
      await streamRef.update({ 
        status: 'error', 
        error: 'Cloud Run worker URL not configured. Please set CLOUD_RUN_WORKER_URL environment variable.' 
      });
      return NextResponse.json({ 
        error: 'Cloud Run worker not configured', 
        message: 'Please configure CLOUD_RUN_WORKER_URL environment variable to enable video rendering.' 
      }, { status: 503 });
    }

    // Track clip count usage
    await trackUsage(streamData?.userId || 'system', 0, clipIds.length);

    await streamRef.update({ status: 'rendering' });

    // Call Cloud Run asynchronously
    // We don't await the response if we want it to be fire-and-forget, 
    // but Cloud Run usually needs a quick ACK.
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${workerUrl}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, clipIds }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Accept 202 (Accepted) or 200 (OK) as success
      if (response.status !== 200 && response.status !== 202) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Cloud Run worker returned status ${response.status}: ${errorText}`);
      }
    } catch (fetchError: any) {
      // If it's an abort (timeout), it's actually fine because the worker acknowledges with 202
      if (fetchError.name !== 'AbortError' && !fetchError.message.includes('aborted')) {
        console.error('Error calling Cloud Run worker:', fetchError);
        // Don't fail the request if Cloud Run call fails - the job might still be processing
        // We'll rely on status checks to see if it succeeded
      }
    }

    return NextResponse.json({ message: 'Rendering triggered' });

  } catch (error: any) {
    console.error('Error triggering render:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

