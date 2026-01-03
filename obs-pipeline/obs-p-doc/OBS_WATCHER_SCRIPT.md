# OBS Watcher Script Documentation
## Automated Upload from OBS Recordings to Google Cloud Storage

This script runs on your local PC and automatically uploads OBS recordings to Google Cloud Storage, then creates Firestore entries for processing.

---

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Google Cloud SDK** installed and configured
3. **Firebase Project** with Firestore enabled
4. **Service Account** with permissions:
   - GCS: Storage Object Admin
   - Firestore: Editor or custom role with write access

---

## Installation

### Step 1: Create Project Directory
```bash
cd /Users/davidv.onquit/2026Codes/videoeditor/obs-pipeline
npm init -y
```

### Step 2: Install Dependencies
```bash
npm install chokidar @google-cloud/storage firebase-admin dotenv
npm install --save-dev @types/node typescript ts-node nodemon
```

### Step 3: Set Up TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 4: Environment Setup
Create `.env` file in the project root:
```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=videoeditor-2508b
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json

# Firebase Configuration
FIREBASE_PROJECT_ID=videoeditor-2508b
FIREBASE_SERVICE_ACCOUNT_KEY=./path/to/service-account-key.json

# OBS Configuration
OBS_RECORDING_FOLDER=C:/Users/YourName/Videos/OBS Recordings
# OR for Mac:
# OBS_RECORDING_FOLDER=/Users/YourName/Movies/OBS Recordings

# Optional: File filters
WATCH_EXTENSIONS=.mp4,.mkv
MIN_FILE_SIZE_MB=10
```

---

## Project Structure

```
obs-pipeline/
├── src/
│   ├── watcher.ts          # Main watcher script
│   ├── uploader.ts          # GCS upload logic
│   ├── firestore.ts         # Firestore operations
│   └── utils.ts             # Helper functions
├── .env                     # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Implementation Details

### File Watching Logic
- Uses `chokidar` to watch the OBS recording folder
- Detects when files are "closed" (OBS finishes writing)
- Filters by file extension (`.mp4`, `.mkv`)
- Validates file size (prevents uploading incomplete files)

### Upload Process
1. **File Detection**: Watches for new files in the recording folder
2. **File Lock Check**: Waits until file is no longer being written (checks file size stability)
3. **GCS Upload**: Uploads to `gs://bucket-name/videos/{filename}`
4. **Firestore Entry**: Creates document with metadata
5. **Cleanup**: Optionally moves file to archive folder (optional)

### Error Handling
- Retry logic for failed uploads (3 attempts with exponential backoff)
- Logging to console and optional log file
- Graceful shutdown on Ctrl+C

---

## Usage

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Run as Background Service
**Windows (using PM2 or Task Scheduler)**:
```bash
pm2 start dist/watcher.js --name obs-watcher
```

**Mac/Linux (using PM2)**:
```bash
pm2 start dist/watcher.js --name obs-watcher
pm2 save
pm2 startup
```

---

## Configuration Options

### File Size Validation
- `MIN_FILE_SIZE_MB`: Minimum file size to upload (default: 10MB)
- Prevents uploading incomplete or corrupted files

### File Stability Check
- Waits 5 seconds after file size stops changing before uploading
- Ensures OBS has finished writing the file

### Archive Option
- Set `ARCHIVE_FOLDER` in `.env` to move files after upload
- Keeps original folder clean

---

## Firestore Document Structure

When a video is uploaded, the script creates a document like this:

```javascript
{
  videoId: "auto-generated-id",
  fileName: "tournament_2026_01_15_14_30_00.mp4",
  gcsPath: "gs://bucket-name/videos/tournament_2026_01_15_14_30_00.mp4",
  uploadedAt: Timestamp,
  status: "uploaded",
  metadata: {
    fileSize: 524288000, // bytes
    localPath: "C:/Users/.../OBS Recordings/tournament_2026_01_15_14_30_00.mp4",
    uploadedBy: "obs-watcher-script"
  }
}
```

---

## Monitoring & Logging

### Console Output
- Real-time status updates
- Upload progress
- Error messages

### Log File (Optional)
- Set `LOG_FILE` in `.env` to enable file logging
- Rotates daily or by size

---

## Troubleshooting

### Issue: Files not detected
- **Check**: OBS recording folder path is correct
- **Check**: File extensions match `WATCH_EXTENSIONS`
- **Check**: Files are actually being saved to the folder

### Issue: Upload fails
- **Check**: GCS credentials are valid
- **Check**: Bucket name is correct
- **Check**: Network connection
- **Check**: File permissions

### Issue: Firestore write fails
- **Check**: Firebase credentials are valid
- **Check**: Firestore rules allow writes
- **Check**: Project ID matches

---

## Security Considerations

1. **Service Account Key**: Store in secure location, never commit to git
2. **Environment Variables**: Use `.env` file (already in `.gitignore`)
3. **Firestore Rules**: Restrict write access to authenticated service accounts only
4. **GCS Permissions**: Use least-privilege principle

---

## Next Steps After Setup

1. **Test with Sample File**: Record a short test video in OBS
2. **Verify Upload**: Check GCS bucket for uploaded file
3. **Verify Firestore**: Check Firestore console for new document
4. **Set Up Cloud Function**: Create trigger for `onVideoUploaded` (Phase 2)

---

## Integration with Phase 2

Once this script is running, the next phase (AI Intelligence Layer) will:
- Listen for new Firestore documents with `status: "uploaded"`
- Trigger Cloud Function `onVideoUploaded`
- Begin video analysis and script generation

---

**Status**: Ready for Implementation
**Dependencies**: See `package.json` after installation

