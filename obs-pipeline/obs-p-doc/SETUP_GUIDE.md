# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] Google Cloud Project created (`videoeditor-2508b`)
- [ ] GCS bucket created for video storage
- [ ] Service account created with permissions:
  - Storage Object Admin (for GCS)
  - Cloud Datastore User (for Firestore)
- [ ] OBS configured to record to a specific folder
- [ ] OBS "Remux to MP4" enabled (Settings → Advanced → Recording)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
cd obs-pipeline
npm install
```

### 2. Create Service Account Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin → Service Accounts
3. Create a new service account or use existing
4. Grant roles:
   - Storage Object Admin
   - Cloud Datastore User
5. Create and download JSON key file
6. Save it securely (e.g., `./keys/service-account.json`)

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `OBS_RECORDING_FOLDER`: Path to where OBS saves recordings
- `GCS_BUCKET_NAME`: Your GCS bucket name
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account JSON

### 4. Create GCS Bucket (if not exists)
```bash
# Using gcloud CLI
gsutil mb -p videoeditor-2508b -l us-central1 gs://your-bucket-name
```

Or create via [Cloud Console](https://console.cloud.google.com/storage)

### 5. Set Up Firestore
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Enable Firestore (if not already enabled)
4. Create collection: `videos` (will be created automatically by script)

### 6. Test the Watcher
```bash
# Development mode (with auto-reload)
npm run dev

# Or build and run
npm run build
npm start
```

### 7. Test with OBS
1. Start the watcher script
2. Record a short test video in OBS
3. Check console for upload progress
4. Verify in GCS bucket that file appears
5. Verify in Firestore that document is created

## Troubleshooting

### "Recording folder does not exist"
- Check `OBS_RECORDING_FOLDER` path is correct
- Use absolute path (not relative)
- On Windows, use forward slashes or double backslashes: `C:/Users/...` or `C:\\Users\\...`

### "GCS upload failed"
- Verify service account has Storage Object Admin role
- Check bucket name is correct
- Verify credentials file path is correct
- Check network connection

### "Firestore write failed"
- Verify service account has Cloud Datastore User role
- Check Firestore is enabled in Firebase Console
- Verify project ID matches

### Files not detected
- Check file extensions match `WATCH_EXTENSIONS` (default: `.mp4,.mkv`)
- Ensure OBS is actually saving files to the watched folder
- Check file size is above `MIN_FILE_SIZE_MB` (default: 10MB)

## Running as a Service

### Using PM2 (Recommended)
```bash
npm install -g pm2
npm run build
pm2 start dist/watcher.js --name obs-watcher
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### Using systemd (Linux)
Create `/etc/systemd/system/obs-watcher.service`:
```ini
[Unit]
Description=OBS Watcher Automation
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/obs-pipeline
ExecStart=/usr/bin/node dist/watcher.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable obs-watcher
sudo systemctl start obs-watcher
```

## Next Steps

Once the watcher is running successfully:
1. ✅ Verify videos are uploading to GCS
2. ✅ Verify Firestore documents are being created
3. ✅ Proceed to Phase 2: Set up Cloud Functions for video analysis

See [SOLID_PLAN.md](./SOLID_PLAN.md) for the complete pipeline roadmap.

