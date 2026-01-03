# Quick Start Guide - Single File Watcher

## The "Paste and Run" Method

This is the simplest setup possible - one file, minimal dependencies.

### Step 1: Create Folder
```bash
# Windows
mkdir C:\Scripts\BilliardUploader
cd C:\Scripts\BilliardUploader

# Mac/Linux
mkdir ~/Scripts/BilliardUploader
cd ~/Scripts/BilliardUploader
```

### Step 2: Save the Script
Copy `index.js` into this folder.

### Step 3: Install Dependencies
```bash
npm install firebase-admin @google-cloud/storage chokidar
```

### Step 4: Get Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`videoeditor-2508b`)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `service-account-key.json` in your script folder

### Step 5: Edit Configuration
Open `index.js` and edit the CONFIG section:

```javascript
const CONFIG = {
  OBS_FOLDER: 'C:/Users/YourName/Videos/OBS Recordings', // Your OBS folder
  PROJECT_ID: 'videoeditor-2508b',
  BUCKET_NAME: 'your-bucket-name-here', // Your GCS bucket
  SERVICE_ACCOUNT_PATH: './service-account-key.json',
  MARKER_FILE: null, // Optional: path to marker file
  // ... rest of config
};
```

### Step 6: Run It
```bash
node index.js
```

The script will:
- ✅ Watch your OBS folder
- ✅ Auto-upload new recordings to GCS
- ✅ Create Firestore documents
- ✅ Sit in your taskbar/terminal and work automatically

### Optional: Run in Background

**Windows (using PM2)**:
```bash
npm install -g pm2
pm2 start index.js --name obs-watcher
pm2 save
```

**Mac/Linux (using PM2)**:
```bash
npm install -g pm2
pm2 start index.js --name obs-watcher
pm2 save
pm2 startup  # Follow instructions
```

## Marker Method Setup (Optional)

If you want to use the free marker method instead of expensive AI:

1. **In OBS**: Go to Settings → Hotkeys
2. **Add Hotkey**: Find "Text Source" or create a custom script
3. **Set Hotkey**: `Ctrl+M` (or any key you prefer)
4. **Action**: Write current timestamp to marker file

Or use a simple OBS plugin/script that writes timestamps to a file when you press the hotkey.

Then update `index.js`:
```javascript
MARKER_FILE: 'C:/Scripts/BilliardUploader/markers.txt',
```

The watcher will automatically read markers and include them in the Firestore document for later processing.

## Troubleshooting

**"Firebase initialization failed"**
- Make sure `service-account-key.json` exists in the same folder
- Check the file path in CONFIG

**"OBS folder not found"**
- Use absolute path (not relative)
- Windows: Use forward slashes or double backslashes
- Check the folder actually exists

**"GCS upload failed"**
- Verify bucket name is correct
- Check service account has Storage Object Admin role
- Verify network connection

## Next Steps

Once the watcher is running:
1. ✅ Test with a short OBS recording
2. ✅ Verify file appears in GCS bucket
3. ✅ Verify Firestore document is created
4. ✅ Proceed to Week 2 (Days 8-14): TTS Integration

See [SOLID_PLAN.md](./SOLID_PLAN.md) for the complete 3-week roadmap.

