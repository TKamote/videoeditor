import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Mark as dynamic to prevent build-time analysis
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { streamId } = await req.json();

    if (!streamId) {
      return NextResponse.json({ error: 'streamId is required' }, { status: 400 });
    }

    const streamRef = adminDb.collection('streams').doc(streamId);
    const streamDoc = await streamRef.get();

    if (!streamDoc.exists) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Update status to cancelled
    await streamRef.update({
      status: 'cancelled',
      error: 'Processing cancelled by user',
      cancelledAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Processing cancelled',
      streamId 
    });

  } catch (error: any) {
    console.error('Error cancelling stream:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel processing', 
      details: error.message 
    }, { status: 500 });
  }
}

