import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured. Missing environment variables.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage
    const fileName = `uploads/${Date.now()}_${file.name}`;
    
    // Use the Firebase Storage bucket (videoeditor-2508b)
    // Try default bucket first, then explicit bucket name
    let bucket;
    try {
      bucket = adminStorage.bucket('videoeditor-2508b.firebasestorage.app');
    } catch (bucketError: any) {
      console.error('Bucket error:', bucketError);
      return NextResponse.json(
        { error: `Failed to access storage bucket: ${bucketError.message}` },
        { status: 500 }
      );
    }
    
    const fileRef = bucket.file(fileName);

    // Upload the file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          userId,
          originalName: file.name,
        },
      },
      public: false, // Keep private, use signed URLs
    });

    // Get download URL (signed URL for 1 year)
    const [downloadURL] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });

    return NextResponse.json({
      success: true,
      downloadURL,
      fileName,
      firebasePath: fileName,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data,
      stack: error.stack,
    });
    
    // Return proper JSON error response
    const statusCode = error.code === 'PERMISSION_DENIED' || error.code === 403 ? 403 : 500;
    return NextResponse.json(
      { 
        error: error.message || 'Upload failed',
        code: error.code || 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: statusCode }
    );
  }
}

