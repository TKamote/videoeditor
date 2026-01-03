# OBS Watcher Automation Pipeline
## Lean Budget Edition - $36/month, 10 hrs/week, 3 months

Automated system for uploading OBS recordings to Google Cloud Storage and triggering the video processing pipeline - **without expensive AI**.

## 🚀 Quick Start (Single File Method)

**The "Paste and Run" Approach:**

1. **Create folder**: `C:\Scripts\BilliardUploader` (or any path)
2. **Copy `index.js`** into that folder
3. **Install dependencies**:
   ```bash
   npm install firebase-admin @google-cloud/storage chokidar
   ```
4. **Get service account key** from Firebase Console → save as `service-account-key.json`
5. **Edit CONFIG section** in `index.js` with your settings
6. **Run**: `node index.js`

That's it! The script will watch your OBS folder and auto-upload to Firebase/GCS.

See **[QUICK_START.md](./QUICK_START.md)** for detailed setup instructions.

## 📚 Documentation

- **[SOLID_PLAN.md](./SOLID_PLAN.md)**: Complete 3-month lean budget plan (~$36/month)
- **[QUICK_START.md](./QUICK_START.md)**: Step-by-step setup guide
- **[OBS_WATCHER_SCRIPT.md](./OBS_WATCHER_SCRIPT.md)**: Detailed technical documentation

## 💰 Budget Breakdown

| Item | Monthly Cost |
|------|--------------|
| Storage (GCS) | ~$8.00 |
| Network (Egress) | ~$12.00 |
| Cloud Run (Editing) | ~$15.00 |
| Gemini API | < $1.00 |
| TTS API | FREE |
| **TOTAL** | **~$36.00** |

## ✨ Key Features

- ✅ **Single-file watcher** (`index.js`) - paste and run
- ✅ **Automatic file detection** when OBS finishes recording
- ✅ **Upload to Google Cloud Storage**
- ✅ **Firestore document creation** for pipeline processing
- ✅ **Marker file support** - free alternative to expensive Video Intelligence
- ✅ **File stability checking** - waits for OBS to finish writing
- ✅ **"Use and Burn" storage** - auto-delete raw videos after processing

## 🎯 3-Week Roadmap (Days 1-21)

- **Week 1 (Days 1-7)**: Automatic Upload (The Watcher) ← **You are here**
- **Week 2 (Days 8-14)**: TTS Integration (Gemini + Cloud TTS)
- **Week 3 (Days 15-21)**: Headless Editor (Cloud Run + FFmpeg)

## 💡 Cost Optimization

Instead of expensive Video Intelligence API ($0.10/minute):
- **Option A**: Marker Method (FREE) - OBS hotkey saves timestamps
- **Option B**: OpenCV Motion Detection (FREE) - local Python script

See [SOLID_PLAN.md](./SOLID_PLAN.md) for complete strategy.

## 📁 Project Structure

```
obs-pipeline/
├── index.js              # ⭐ Single-file watcher (use this!)
├── src/                   # Multi-file version (optional)
│   ├── watcher.ts
│   ├── uploader.ts
│   ├── firestore.ts
│   └── utils.ts
├── SOLID_PLAN.md         # Complete 3-month plan
├── QUICK_START.md        # Setup guide
└── package-simple.json   # Minimal dependencies
```

## 🎬 Next Steps

After setting up the watcher:
1. ✅ Test with a short OBS recording
2. ✅ Verify upload to GCS
3. ✅ Verify Firestore document creation
4. ✅ Proceed to Week 2 (Days 8-14): TTS Integration

See [SOLID_PLAN.md](./SOLID_PLAN.md) for the complete roadmap.

