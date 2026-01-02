const express = require('express');
const admin = require('firebase-admin');

// 1. Initialize Firebase FIRST
admin.initializeApp();

// 2. NOW import the processor
const { processClips } = require('./ffmpeg-processor');

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
  const { streamId, clipIds } = req.body;

  if (!streamId || !clipIds) {
    return res.status(400).send('Missing streamId or clipIds');
  }

  // Acknowledge immediately
  res.status(202).send('Rendering started');

  try {
    await processClips(streamId, clipIds);
    console.log(`Successfully processed clips for stream ${streamId}`);
  } catch (error) {
    console.error(`Error processing clips for stream ${streamId}:`, error);
    const db = admin.firestore();
    await db.collection('streams').doc(streamId).update({ status: 'error', error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`FFmpeg worker listening on port ${PORT}`);
});
