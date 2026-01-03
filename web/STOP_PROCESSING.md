# How to Stop Video Processing

## Quick Method (Via Web App)

If you see "Processing..." on a video in the web app:

1. Click the **"Stop Processing"** button (red button below the processing indicator)
2. Confirm the cancellation
3. The status will be updated to "cancelled"

**Note**: The Google Video Intelligence API operation will continue running on Google's servers (can't be cancelled), but your app will stop checking for results and mark it as cancelled.

---

## Manual Method (Via Firestore Console)

If the button doesn't work or you need to stop multiple videos:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `videoeditor-2508b`
3. Go to **Firestore Database**
4. Find the `streams` collection
5. Open the document for the video you want to stop
6. Click **Edit** (pencil icon)
7. Update these fields:
   - `status`: Change to `"cancelled"`
   - `error`: Add `"Processing cancelled by user"`
8. Click **Update**

---

## What Happens When You Stop?

- ✅ **Your app stops checking** for Video Intelligence results
- ✅ **Status updates** to "cancelled" in Firestore
- ⚠️ **Google's operation continues** (can't be cancelled - it's already running)
- ⚠️ **You may still be charged** for the Video Intelligence API usage (if it completes)

---

## Alternative: Just Ignore It

If you don't want to deal with it:
- Just **ignore the processing video**
- It will eventually complete (or timeout)
- You can delete the stream document later if needed
- Focus on your new `obs-pipeline` project instead!

---

## API Endpoint (For Developers)

You can also call the cancel API directly:

```bash
curl -X POST https://your-app.vercel.app/api/streams/cancel \
  -H "Content-Type: application/json" \
  -d '{"streamId": "your-stream-id"}'
```

---

**Recommendation**: Since you're focusing on the new `obs-pipeline` project, you can just ignore the old web app processing. It will finish eventually, and you won't need to use that expensive Video Intelligence approach anymore!

