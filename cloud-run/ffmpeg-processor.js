const ffmpeg = require('fluent-ffmpeg');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const os = require('os');

async function processClips(streamId, clipIds) {
  const db = admin.firestore();
  const storage = new Storage();

  const streamRef = db.collection('streams').doc(streamId);
  const streamDoc = await streamRef.get();
  const streamData = streamDoc.data();

  if (!streamData) throw new Error('Stream not found');

  const gcsPath = streamData.gcsPath;
  const bucketName = gcsPath.split('/')[2];
  const fileName = gcsPath.split('/').slice(3).join('/');
  
  const bucket = storage.bucket(bucketName);
  const tempInputPath = path.join(os.tmpdir(), `input_${streamId}.mp4`);

  console.log(`Downloading stream ${streamId}...`);
  await bucket.file(fileName).download({ destination: tempInputPath });

  for (const clipId of clipIds) {
    try {
      const clipRef = db.collection('clips').doc(clipId);
      const clipDoc = await clipRef.get();
      const clipData = clipDoc.data();

      if (!clipData) continue;

      await clipRef.update({ status: 'rendering' });

      const tempOutputPath = path.join(os.tmpdir(), `clip_${clipId}.mp4`);
      
      await new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
          .setStartTime(clipData.startTime)
          .setDuration(clipData.endTime - clipData.startTime)
          .output(tempOutputPath)
          .videoCodec('libx264')
          .size('1920x1080')
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      const destination = `clips/${streamId}/${clipId}.mp4`;
      await bucket.upload(tempOutputPath, { destination });
      
      const [downloadUrl] = await bucket.file(destination).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      await clipRef.update({
        status: 'completed',
        gcsPath: `gs://${bucketName}/${destination}`,
        downloadUrl,
      });

      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);

    } catch (clipError) {
      console.error(`Error clip ${clipId}:`, clipError);
      await db.collection('clips').doc(clipId).update({ status: 'error', error: clipError.message });
    }
  }

  if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
  await streamRef.update({ status: 'completed' });
}

module.exports = { processClips };
