# Debug PERMISSION_DENIED Error

Even with all the roles, you're still getting permission errors. Let's check these:

## 1. Verify Service Account Email Matches

**In Vercel:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Check `FIREBASE_CLIENT_EMAIL` and `GOOGLE_CLOUD_CLIENT_EMAIL`
- Copy the email address

**In Google Cloud IAM:**
- Go to: https://console.cloud.google.com/iam-admin/iam?project=videoeditor-2508b
- Find the service account with that email
- Make sure it's the same one you added roles to

**They must match exactly!**

## 2. Check GCS Bucket Exists

The code tries to copy to a GCS bucket. Check:

1. **In Vercel Environment Variables:**
   - Is `GCS_BUCKET_NAME` set?
   - What value does it have?

2. **In Google Cloud Console:**
   - Go to: https://console.cloud.google.com/storage/browser?project=videoeditor-2508b
   - Does the bucket from `GCS_BUCKET_NAME` exist?
   - If not, create it or update the env var

## 3. Check Project IDs Match

**In Vercel:**
- `FIREBASE_PROJECT_ID` should be: `videoeditor-2508b`
- `GOOGLE_CLOUD_PROJECT_ID` should be: `videoeditor-2508b`

**In Google Cloud:**
- Make sure you're adding roles in project: `videoeditor-2508b`

## 4. Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Try "Process AI" again
3. Look for the detailed error message
4. It should show which operation failed (file copy vs Video Intelligence API)

## 5. Wait for Propagation

After adding roles, wait 2-3 minutes for permissions to propagate before testing.

