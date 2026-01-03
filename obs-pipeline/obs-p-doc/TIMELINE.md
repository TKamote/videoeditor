# Development Timeline: 2-3 Weeks (Days 1-21)

## Overview

**Total Timeline**: 2-3 weeks (15-21 days)  
**Time Investment**: 10 hours/week  
**Goal**: Complete automated pipeline from OBS to finished highlights

---

## Week 1: Automatic Upload (Days 1-7)

### Day 1-2: OBS Watcher Setup
- [ ] Copy `index.js` to local folder
- [ ] Install dependencies (`npm install`)
- [ ] Get Firebase service account key
- [ ] Configure CONFIG section in `index.js`
- [ ] Test with sample OBS recording

### Day 2-3: GCS & Firestore Setup
- [ ] Create GCS bucket
- [ ] Configure lifecycle policy (auto-delete after 2 days)
- [ ] Set up Firestore `videos` collection
- [ ] Test upload to GCS
- [ ] Verify Firestore document creation

### Day 4-5: Marker Method (Optional)
- [ ] Configure OBS hotkey (Ctrl+M)
- [ ] Set up marker file writing
- [ ] Update `MARKER_FILE` path in `index.js`
- [ ] Test marker reading

### Day 5-7: Testing & Refinement
- [ ] Record test video in OBS
- [ ] Verify automatic upload
- [ ] Verify Firestore documents
- [ ] Test marker file reading (if using)
- [ ] Verify GCS lifecycle policy (auto-delete)
- [ ] Fix any issues

**Week 1 Deliverable**: ✅ Videos automatically uploading to GCS and creating Firestore documents

---

## Week 2: TTS Integration (Days 8-14)

### Day 8-10: Cloud Functions Setup
- [ ] Create Firebase Cloud Functions project
- [ ] Set up `onVideoUploaded` function
- [ ] Integrate Gemini API for script generation
- [ ] Test script generation with sample markers

### Day 10-12: TTS Generation
- [ ] Create `onScriptGenerated` function
- [ ] Integrate Google Cloud TTS API
- [ ] Configure professional commentary voice
- [ ] Test TTS audio generation

### Day 12-14: Integration & Testing
- [ ] Test full flow: Upload → Script → TTS
- [ ] Verify Firestore updates
- [ ] Verify GCS audio file storage
- [ ] Fix any issues

**Week 2 Deliverable**: ✅ Automatic script and TTS generation for uploaded videos

---

## Week 3: Headless Editor (Days 15-21)

### Day 15-17: Cloud Run Adaptation
- [ ] Review existing `cloud-run/` code
- [ ] Adapt for marker-based workflow
- [ ] Add TTS audio overlay support
- [ ] Add logo/branding overlay
- [ ] Test locally with Docker

### Day 17-19: Cloud Run Deployment
- [ ] Build Docker image
- [ ] Deploy to Google Cloud Run
- [ ] Configure environment variables
- [ ] Test Cloud Run endpoint
- [ ] Verify video processing

### Day 19-21: Full Pipeline Testing
- [ ] Test complete flow: Upload → Script → TTS → Render
- [ ] Verify final video output
- [ ] Test with multiple videos
- [ ] Verify GCS cleanup (raw video deletion)
- [ ] Performance optimization
- [ ] Documentation

**Week 3 Deliverable**: ✅ Complete automated pipeline from OBS to finished highlights

---

## Daily Time Allocation

**10 hours/week = ~1.5 hours/day**

### Typical Day Structure:
- **Morning (30 min)**: Review previous day, plan today
- **Development (1 hour)**: Code, test, debug
- **Evening (15 min)**: Document progress, update checklist

### Weekend Focus:
- **Saturday (2-3 hours)**: Bigger tasks, integration testing
- **Sunday (1 hour)**: Review week, plan next week

---

## Milestone Checkpoints

### ✅ End of Day 7 (Week 1)
- Videos auto-uploading to GCS
- Firestore documents created
- Marker method working (if using)

### ✅ End of Day 14 (Week 2)
- Scripts auto-generated
- TTS audio files created
- Full upload → script → TTS flow working

### ✅ End of Day 21 (Week 3)
- Complete pipeline operational
- Cloud Run processing videos
- Final highlights ready for download

---

## Risk Mitigation

### Potential Delays:
- **GCS/Firebase setup issues**: Add 1 day buffer
- **Cloud Functions deployment**: Add 1 day buffer
- **Cloud Run debugging**: Add 2 day buffer

### Contingency Plan:
- If behind schedule, prioritize core features
- Optional features (markers, branding) can be added later
- Minimum viable: Upload → TTS → Render (without markers)

---

## Success Criteria

By Day 21, you should have:
- ✅ OBS recordings automatically uploading
- ✅ Scripts automatically generated
- ✅ TTS commentary automatically created
- ✅ Videos automatically rendered with audio
- ✅ Raw videos automatically deleted
- ✅ Final highlights ready for YouTube

**Status**: Ready to start Day 1! 🚀

