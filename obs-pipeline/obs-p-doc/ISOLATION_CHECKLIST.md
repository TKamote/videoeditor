# Project Isolation Checklist
## Ensuring obs-pipeline doesn't interfere with web/ and cloud-run/

This checklist ensures the three projects remain completely isolated and independent.

---

## ✅ Project Structure Verification

### Current Structure
```
videoeditor/
├── web/              # Next.js web app (manual video editing)
├── cloud-run/       # FFmpeg worker service (not deployed)
└── obs-pipeline/    # Automated OBS → Cloud pipeline ← Focus here
```

### Isolation Status
- ✅ **Separate folders** - Each project in its own directory
- ✅ **Separate package.json** - No shared dependencies
- ✅ **Separate node_modules** - Each project manages its own
- ✅ **No cross-references** - Projects don't import from each other

---

## 🔒 Firestore Collections Isolation

### Web App Uses:
- Collection: `streams` (for uploaded videos)
- Collection: `clips` (for detected clips)
- **Status**: Active, but slow/expensive

### obs-pipeline Uses:
- Collection: `videos` (for auto-uploaded videos)
- **Status**: New, separate collection
- **No Conflict**: Different collection names = no interference

### Verification
```bash
# Check Firestore collections
# web/ uses: streams, clips
# obs-pipeline/ uses: videos
# ✅ No overlap = Safe
```

---

## 🔒 GCS Bucket Structure Isolation

### Web App Uses:
- Path: `streams/{streamId}_{fileName}`
- Path: `clips/{streamId}/{clipId}.mp4`

### obs-pipeline Uses:
- Path: `videos/{fileName}` (raw uploads)
- Path: `finals/{videoId}.mp4` (final edited videos)
- **No Conflict**: Different path prefixes = no interference

### Verification
- ✅ Different folder structures
- ✅ Can use same bucket (different paths)
- ✅ Or use separate buckets (recommended for clarity)

---

## 🔒 Environment Variables Isolation

### Web App (Vercel):
- `FIREBASE_PROJECT_ID`
- `GOOGLE_CLOUD_PROJECT_ID`
- `GCS_BUCKET_NAME`
- `GEMINI_API_KEY`
- `CLOUD_RUN_WORKER_URL`

### obs-pipeline (Local):
- `GOOGLE_CLOUD_PROJECT_ID` (same project, OK)
- `GCS_BUCKET_NAME` (can be same or different)
- `GOOGLE_APPLICATION_CREDENTIALS` (service account path)
- `OBS_RECORDING_FOLDER` (local path)
- `FIREBASE_PROJECT_ID` (same project, OK)

### Verification
- ✅ Different deployment targets (Vercel vs Local)
- ✅ Can share same Firebase project (different collections)
- ✅ Can share same GCS bucket (different paths)

---

## 🔒 Code Dependencies Isolation

### Web App Dependencies:
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "firebase": "^10.x",
  "@google-cloud/video-intelligence": "^x.x"
}
```

### obs-pipeline Dependencies:
```json
{
  "firebase-admin": "^12.0.0",
  "@google-cloud/storage": "^7.7.0",
  "chokidar": "^3.5.3"
}
```

### Verification
- ✅ No shared npm packages (except Firebase, which is fine)
- ✅ Different runtime (Next.js vs Node.js script)
- ✅ No imports between projects

---

## 🔒 Service Account Permissions

### Required Permissions for obs-pipeline:
- ✅ Storage Object Admin (GCS upload)
- ✅ Cloud Datastore User (Firestore write)
- ✅ **NOT** Video Intelligence API (we use markers instead)

### Verification
- ✅ Minimal permissions needed
- ✅ No access to web app's resources
- ✅ Can use same service account or separate (recommended: separate)

---

## 🚫 What NOT to Do

### ❌ Don't:
1. Import files from `web/` or `cloud-run/` into `obs-pipeline/`
2. Modify `web/` or `cloud-run/` while working on `obs-pipeline/`
3. Use same Firestore collection names (`streams`, `clips`)
4. Use same GCS paths (`streams/`, `clips/`)
5. Share environment variables between projects (except project IDs)

### ✅ Do:
1. Keep all work in `obs-pipeline/` folder
2. Use `videos` collection (not `streams`)
3. Use `videos/` and `finals/` GCS paths (not `streams/`, `clips/`)
4. Test independently before any integration
5. Document any future integration points

---

## 🧪 Testing Isolation

### Test Checklist:
- [ ] Run `obs-pipeline` watcher script
- [ ] Verify it creates documents in `videos` collection (not `streams`)
- [ ] Verify it uploads to `videos/` path in GCS (not `streams/`)
- [ ] Verify `web/` app still works (no interference)
- [ ] Verify `cloud-run/` code unchanged (no interference)

### Verification Commands:
```bash
# Check Firestore collections
# Should see: videos (new), streams (existing), clips (existing)

# Check GCS bucket
# Should see: videos/ folder (new), streams/ folder (existing)

# Check no code changes in web/
git status web/
# Should show no changes

# Check no code changes in cloud-run/
git status cloud-run/
# Should show no changes
```

---

## 📋 Pre-Development Checklist

Before starting work on `obs-pipeline/`:

- [ ] Verify current folder structure (3 separate projects)
- [ ] Review this isolation checklist
- [ ] Confirm Firestore collection names are different
- [ ] Confirm GCS paths are different
- [ ] Backup current state (git commit or copy)
- [ ] Set up separate service account (optional but recommended)

---

## 🔄 Future Integration Points

When ready to integrate (Week 3, Days 15-21):

### Cloud Run Integration:
- `obs-pipeline/` will call Cloud Run service
- Cloud Run will read from `videos` collection (not `streams`)
- Cloud Run will process videos from `videos/` path (not `streams/`)
- **Still isolated**: Different data sources, same service

### Potential Merge:
- If merging workflows later, create migration plan
- Don't modify existing `web/` collections
- Create new unified schema if needed

---

## ✅ Current Status

**Isolation Level**: 🟢 **FULLY ISOLATED**

- ✅ Separate folders
- ✅ Separate Firestore collections
- ✅ Separate GCS paths
- ✅ Separate dependencies
- ✅ No code cross-references
- ✅ Safe to develop independently

**Last Verified**: January 2026
**Next Review**: Before Week 3 (Days 15-21, Cloud Run integration)

---

## 📝 Notes

- All three projects can coexist peacefully
- `obs-pipeline/` is designed to be independent
- No changes needed to `web/` or `cloud-run/` for Week 1-2 (Days 1-14)
- Week 3 (Days 15-21) will adapt `cloud-run/` but won't break `web/`

**Safe to proceed with obs-pipeline development!** 🚀

