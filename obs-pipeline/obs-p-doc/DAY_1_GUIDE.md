# Day 1: OBS Watcher Setup Guide
## Step-by-Step Instructions

**Goal**: Get the OBS watcher script running and ready to auto-upload videos.

**Time Estimate**: 1-2 hours  
**Prerequisites**: Node.js installed, OBS installed, Firebase project access

---

## ✅ Step 1: Create Local Folder (5 minutes)

### On Mac (your system):
```bash
mkdir -p ~/Scripts/BilliardUploader
cd ~/Scripts/BilliardUploader
```

### On Windows:
```bash
mkdir C:\Scripts\BilliardUploader
cd C:\Scripts\BilliardUploader
```

**Verify**: You should now be in an empty folder.

---

## ✅ Step 2: Copy the Script (2 minutes)

Copy `index.js` from the `obs-pipeline` folder to your new local folder:

```bash
# From the videoeditor directory
cp obs-pipeline/index.js ~/Scripts/BilliardUploader/
```

Or manually:
1. Open `obs-pipeline/index.js` in your editor
2. Copy all contents
3. Create new file `index.js` in `~/Scripts/BilliardUploader/`
4. Paste the contents

**Verify**: You should have `index.js` in your local folder.

---

## ✅ Step 3: Initialize npm (1 minute)

```bash
cd ~/Scripts/BilliardUploader
npm init -y
```

This creates a `package.json` file.

---

## ✅ Step 4: Install Dependencies (2 minutes)

```bash
npm install firebase-admin @google-cloud/storage chokidar
```

**Verify**: You should see `node_modules/` folder created.

---

## ✅ Step 5: Get Firebase Service Account Key (10 minutes)

### 5.1 Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **videoeditor-2508b**

### 5.2 Generate Service Account Key
1. Click the gear icon ⚙️ → **Project Settings**
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Click **Generate Key** in the popup
5. A JSON file will download

### 5.3 Save the Key
1. Rename the downloaded file to: `service-account-key.json`
2. Move it to your script folder: `~/Scripts/BilliardUploader/service-account-key.json`

**⚠️ Security Note**: This file contains sensitive credentials. Never commit it to git!

**Verify**: You should have `service-account-key.json` in your script folder.

---

## ✅ Step 6: Find Your OBS Recording Folder (5 minutes)

### Option A: Check OBS Settings
1. Open OBS Studio
2. Go to **Settings** → **Output**
3. Look for **Recording Path** or **Recording Folder**
4. Copy the full path

### Option B: Default Locations
- **Mac**: `~/Movies/OBS Recordings/` or `~/Videos/OBS Recordings/`
- **Windows**: `C:\Users\YourName\Videos\OBS Recordings\`

**Verify**: Note down the exact path to your OBS recording folder.

---

## ✅ Step 7: Configure the Script (5 minutes)

Open `index.js` in your editor and update the CONFIG section:

```javascript
const CONFIG = {
  // Update this with your actual OBS folder path
  OBS_FOLDER: '/Users/davidv.onquit/Movies/OBS Recordings', // Mac example
  // OBS_FOLDER: 'C:/Users/YourName/Videos/OBS Recordings', // Windows example
  
  // These should already be correct
  PROJECT_ID: 'videoeditor-2508b',
  BUCKET_NAME: 'your-bucket-name-here', // ⚠️ We'll set this in Day 2
  SERVICE_ACCOUNT_PATH: './service-account-key.json',
  
  // Leave these as-is for now
  MARKER_FILE: null, // We'll set this up in Day 4-5 if needed
  WATCH_EXTENSIONS: ['.mp4', '.mkv'],
  MIN_FILE_SIZE_MB: 10,
  STABILITY_WAIT_MS: 5000,
};
```

**What to update**:
- ✅ `OBS_FOLDER`: Your actual OBS recording folder path
- ⚠️ `BUCKET_NAME`: Leave as `'your-bucket-name-here'` for now (we'll create bucket in Day 2)

**Verify**: Save the file after making changes.

---

## ✅ Step 8: Test the Script (10 minutes)

### 8.1 Check for Errors
```bash
cd ~/Scripts/BilliardUploader
node index.js
```

**Expected Output**:
```
🚀 Initializing OBS Watcher...

✅ Firebase initialized
✅ Google Cloud Storage initialized
✅ OBS folder verified: /Users/.../OBS Recordings

👀 Starting file watcher...
📁 Watching: /Users/.../OBS Recordings
📝 Extensions: .mp4, .mkv

✅ Watcher ready. Waiting for OBS recordings...
```

### 8.2 Common Errors & Fixes

**Error: "Firebase initialization failed"**
- ✅ Check `service-account-key.json` exists in the folder
- ✅ Verify the file path in CONFIG is correct: `'./service-account-key.json'`

**Error: "OBS folder not found"**
- ✅ Use absolute path (not relative)
- ✅ Mac: Use `/Users/...` format
- ✅ Windows: Use `C:/Users/...` format (forward slashes work)
- ✅ Verify the folder actually exists

**Error: "GCS initialization failed"**
- ⚠️ This is OK for Day 1 - we'll create the bucket in Day 2
- The script will fail when trying to upload, but watching should work

### 8.3 Test File Detection
1. Keep the script running
2. Record a short test video in OBS (10-20 seconds)
3. Stop the recording
4. Watch the terminal - you should see:
   ```
   📹 New file detected: test_video.mp4
   ⏳ Waiting for file to stabilize...
   ```

**Note**: Upload will fail until we set up the GCS bucket (Day 2), but file detection should work!

---

## ✅ Step 9: Stop the Script

Press `Ctrl+C` to stop the watcher.

---

## 🎯 Day 1 Completion Checklist

- [ ] Local folder created (`~/Scripts/BilliardUploader`)
- [ ] `index.js` copied to local folder
- [ ] Dependencies installed (`npm install`)
- [ ] Service account key downloaded and saved
- [ ] OBS recording folder path identified
- [ ] CONFIG section updated in `index.js`
- [ ] Script runs without errors (watcher starts)
- [ ] File detection works (test recording detected)

---

## 🚀 What's Next?

**Day 2**: We'll create the GCS bucket and configure Firestore so uploads actually work!

**For Now**: The watcher is ready. It will detect files but won't upload until Day 2 setup is complete.

---

## 💡 Pro Tips

1. **Keep the script running**: Once Day 2 is done, you can leave this running in the background
2. **Test with small files**: Use short test recordings to avoid long uploads during testing
3. **Check OBS settings**: Make sure OBS is set to remux to MP4 (Settings → Advanced → Recording)

---

## ❓ Troubleshooting

If you encounter issues:

1. **Check Node.js version**: `node --version` (should be 18+)
2. **Verify file paths**: Use absolute paths, not relative
3. **Check permissions**: Make sure you can read the OBS folder
4. **Review error messages**: They usually tell you exactly what's wrong

**Status**: Day 1 Complete! ✅ Ready for Day 2: GCS & Firestore Setup

