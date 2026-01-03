# Custom Stream Editor - High-Level Approach

## Architecture Overview

```
[Stream Recording] 
    ↓
[Google Cloud Storage Bucket] 
    ↓
[Next.js API Routes on Vercel] 
    ↓
[Google Video Intelligence + Gemini 2.5 Flash]
    ↓
[Firebase Firestore] (store timestamps/metadata)
    ↓
[FFmpeg Cloud Worker] (actual video cutting)
    ↓
[Output: Edited clips back to GCS/Firebase Storage]
    ↓
[Web Dashboard] (review/download clips)
```

---

## Proposed Tech Stack

### Frontend
**Next.js Web App** (Primary Interface)
- Upload streams
- Review AI-suggested clips
- Approve/reject highlights
- Download final cuts
- Monitor processing status

**React Native App** (Optional - Future Enhancement)
- View clips on mobile
- Quick approval/sharing to socials
- Push notifications for completed processing

### Backend (Existing Stack + Google APIs)
- **Vercel**: API routes for orchestration
- **Firebase**: 
  - Storage: Temporary upload before GCS transfer
  - Firestore: Store analysis results, clip metadata
  - Functions: Optional background processing
- **Google Cloud**:
  - Storage: Main video hosting (required for Video Intelligence API)
  - Video Intelligence API: Scene detection
  - Gemini 2.5 Flash: Content understanding
  - Cloud Run (optional): For long-running FFmpeg jobs

---

## Workflow Steps

### Phase 1: Upload & Analysis
1. User uploads 2-hour stream via Next.js web app
2. Video temporarily stored in Firebase Storage
3. Background job transfers to Google Cloud Storage
4. Trigger Video Intelligence API:
   - Detect shot changes
   - Label detection (face, gameplay, chat)
5. Trigger Gemini 2.5 Flash:
   - Prompt: "Find the 5 most exciting moments with action/reactions"
   - Returns timestamps + descriptions
6. Store results in Firestore

### Phase 2: Review & Edit
1. Dashboard shows AI-suggested clips with thumbnails
2. You review and approve/reject
3. Optionally adjust timestamps manually
4. Click "Generate Clips"

### Phase 3: Rendering
1. Trigger FFmpeg job (Cloud Run or background worker)
2. Cut video based on approved timestamps
3. Optional: Add captions, intro/outro
4. Upload final clips to Firebase Storage
5. Notify you via email/push notification

### Phase 4: Distribution
1. Download clips from dashboard
2. Optional: Direct upload to YouTube/TikTok via APIs

---

## Key Technical Decisions

### 1. Where to run FFmpeg?

**Option A: Vercel Background Functions** (10-min timeout)
- Pros: Easy integration with your Next.js app
- Cons: Limited timeout, might not finish 2-hour processing

**Option B: Google Cloud Run** (Recommended)
- Pros: Can run for hours, scales automatically
- Cons: Need to deploy a separate container

**Option C: Firebase Functions** (60-second timeout for free tier)
- Pros: Stays in Firebase ecosystem
- Cons: Too short for video processing

**Recommendation**: Use **Cloud Run** for FFmpeg jobs, triggered from Vercel API routes.

### 2. Cost Estimates (Monthly, assuming 10 hours of stream/month)
- Google Cloud Storage: ~$2-5
- Video Intelligence API: First 1,000 min free, then ~$0.10/min
- Gemini 2.5 Flash: Generous free tier (likely $0 for your usage)
- Cloud Run: ~$5-10 for FFmpeg processing
- **Total**: ~$10-20/month

### 3. Development Timeline
- **Week 1**: Setup GCS bucket, Video Intelligence integration
- **Week 2**: Gemini 2.5 Flash integration + Firestore schema
- **Week 3**: FFmpeg Cloud Run container
- **Week 4**: Next.js dashboard UI
- **Week 5**: Testing & refinement

---

## Simplified MVP Scope

If you want to start even simpler:

1. **Manual Upload**: Web form to upload stream
2. **Auto-Analysis**: Run Video Intelligence + Gemini
3. **Review UI**: Simple list of suggested clips
4. **Manual Download**: Generate clips on-demand (no automation yet)

This MVP can be built in 2-3 weeks and would give you immediate value while you iterate on automation features.

---

## Questions Before We Proceed

1. **Primary use case**: Is this for your billiard streams specifically, or general-purpose?
2. **Clip length preference**: 30-second shorts? 2-minute highlights? Mix?
3. **Existing infrastructure**: Do you already have a Google Cloud account/project?
4. **Privacy**: Are streams private (only you use this) or will others upload?
5. **Priority**: Speed to market vs. feature completeness?

---

## Next Steps

Once we align on the approach, I can create:
- Firestore schema design
- API route structure
- Cloud Run FFmpeg container setup
- Step-by-step implementation guide
- Sample code for Video Intelligence + Gemini integration

---

## Technical Resources

### Google Cloud APIs
- [Video Intelligence API Documentation](https://cloud.google.com/video-intelligence/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

### NPM Packages
- `@google-cloud/video-intelligence` - Video analysis
- `@google/generative-ai` - Gemini API client
- `fluent-ffmpeg` - FFmpeg wrapper for Node.js
- `firebase-admin` - Firebase backend SDK

### FFmpeg Commands (Reference)
```bash
# Extract clip from timestamp
ffmpeg -i input.mp4 -ss 00:12:05 -to 00:12:45 -c copy output.mp4

# Add intro/outro
ffmpeg -i intro.mp4 -i clip.mp4 -i outro.mp4 -filter_complex concat=n=3:v=1:a=1 final.mp4

# Generate vertical (9:16) for TikTok/Shorts
ffmpeg -i input.mp4 -vf "crop=ih*9/16:ih" -c:a copy output.mp4
```

---

## Project Structure (Proposed)

```
stream-editor/
├── web/                          # Next.js Web App
│   ├── pages/
│   │   ├── api/
│   │   │   ├── upload.ts         # Handle video uploads
│   │   │   ├── analyze.ts        # Trigger AI analysis
│   │   │   ├── generate-clips.ts # Trigger FFmpeg
│   │   │   └── status.ts         # Check processing status
│   │   ├── index.tsx             # Dashboard
│   │   ├── upload.tsx            # Upload page
│   │   └── clips.tsx             # Review clips
│   ├── lib/
│   │   ├── firebase.ts           # Firebase config
│   │   ├── gcs.ts                # Google Cloud Storage
│   │   └── gemini.ts             # Gemini API wrapper
│   └── components/
│       ├── ClipCard.tsx          # Clip preview component
│       └── UploadForm.tsx        # Upload UI
│
├── cloud-run/                    # FFmpeg Worker (Docker)
│   ├── Dockerfile
│   ├── index.js                  # Express server
│   └── ffmpeg-processor.js       # Video cutting logic
│
├── mobile/                       # React Native (Optional)
│   └── [Future implementation]
│
└── README.md
```

---

## Current Status
- ✅ Architecture defined
- ✅ Tech stack selected
- ⏳ Awaiting client confirmation on questions
- ⏳ Ready to proceed with detailed planning

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2025  
**Created for**: David Verano (@tkamot.com)
