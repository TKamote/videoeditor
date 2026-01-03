# Day 1 Checklist: OBS Watcher Setup

## Quick Reference

**Goal**: Get OBS watcher script running locally  
**Time**: 1-2 hours  
**Status**: ⬜ Not Started

---

## Setup Steps

### ✅ Environment Setup
- [ ] Created local folder: `~/Scripts/BilliardUploader`
- [ ] Copied `index.js` to local folder
- [ ] Initialized npm: `npm init -y`
- [ ] Installed dependencies: `npm install firebase-admin @google-cloud/storage chokidar`

### ✅ Firebase Setup
- [ ] Opened Firebase Console
- [ ] Selected project: `videoeditor-2508b`
- [ ] Generated service account key
- [ ] Saved as `service-account-key.json` in script folder

### ✅ OBS Configuration
- [ ] Found OBS recording folder path
- [ ] Verified OBS is set to remux to MP4 (optional, but recommended)
- [ ] Tested recording a short video

### ✅ Script Configuration
- [ ] Updated `OBS_FOLDER` in CONFIG section
- [ ] Verified `PROJECT_ID` is `'videoeditor-2508b'`
- [ ] Left `BUCKET_NAME` as `'your-bucket-name-here'` (Day 2 task)
- [ ] Verified `SERVICE_ACCOUNT_PATH` is `'./service-account-key.json'`

### ✅ Testing
- [ ] Ran script: `node index.js`
- [ ] Script initialized without errors
- [ ] Watcher started successfully
- [ ] Test recording detected by watcher
- [ ] Script stopped cleanly (Ctrl+C)

---

## Notes

**OBS Folder Path**: `___________________________`

**Issues Encountered**:
- 

**Next Steps**: Day 2 - GCS Bucket & Firestore Setup

---

## Completion Status

**Day 1**: ⬜ In Progress | ✅ Complete

**Date Completed**: _______________

