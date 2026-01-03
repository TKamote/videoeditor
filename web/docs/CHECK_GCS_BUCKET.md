# Check GCS Bucket Exists

Your GCS bucket name is: `videoeditor-streams`

## Steps to Verify:

1. **Check if bucket exists:**
   - Go to: https://console.cloud.google.com/storage/browser?project=videoeditor-2508b
   - Look for bucket: `videoeditor-streams`
   - If it doesn't exist, create it (see below)

2. **If bucket doesn't exist, create it:**
   - Click "CREATE BUCKET"
   - Name: `videoeditor-streams`
   - Location: Choose a region (e.g., `us-central1`)
   - Click "CREATE"

3. **Verify service account has access:**
   - Go to bucket: https://console.cloud.google.com/storage/browser/videoeditor-streams?project=videoeditor-2508b
   - Click "PERMISSIONS" tab
   - Check if `videoeditor-service@videoeditor-2508b.iam.gserviceaccount.com` is listed
   - If not, click "ADD PRINCIPAL"
   - Add the service account with role: **Storage Admin**

## Alternative: Check via gsutil

Run this command to check if bucket exists:
```bash
gsutil ls -b gs://videoeditor-streams
```

If it says "BucketNotFoundException", the bucket doesn't exist and needs to be created.

