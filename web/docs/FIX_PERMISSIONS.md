# Fix PERMISSION_DENIED Error

## Problem
Error: `7 PERMISSION_DENIED: Missing or insufficient permissions`

This happens when your service account doesn't have the required IAM roles.

## Solution: Add IAM Roles

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **videoeditor-2508b** (or your project)
3. Navigate to **IAM & Admin** → **IAM**

### Step 2: Find Your Service Account
1. Look for the service account email that matches your `FIREBASE_CLIENT_EMAIL` or `GOOGLE_CLOUD_CLIENT_EMAIL` environment variable
2. It should look like: `xxxxx@videoeditor-2508b.iam.gserviceaccount.com`

### Step 3: Add Required Roles
Click the **pencil icon (Edit)** next to your service account, then add these roles:

1. **Storage Admin** (`roles/storage.admin`)
   - Allows copying files between Firebase Storage and GCS buckets

2. **Video Intelligence API User** (`roles/videointelligence.admin` or `roles/videointelligence.user`)
   - Allows using the Video Intelligence API

3. **Storage Object Admin** (`roles/storage.objectAdmin`)
   - Allows managing objects in storage buckets

### Step 4: Save and Test
1. Click **SAVE**
2. Wait 1-2 minutes for permissions to propagate
3. Try "Process AI" again in your app

## Alternative: Use Predefined Roles

If you want to grant all permissions at once, you can use:
- **Storage Admin** - covers most storage operations
- **Video Intelligence API Admin** - covers Video Intelligence API

## Verify Permissions

After adding roles, the service account should have:
- ✅ Read/write access to Firebase Storage bucket
- ✅ Read/write access to GCS bucket
- ✅ Permission to call Video Intelligence API

## Still Getting Errors?

1. **Check the service account email** in Vercel environment variables matches the one in Google Cloud
2. **Wait 2-3 minutes** after adding roles (permissions take time to propagate)
3. **Check the project ID** matches in both places:
   - Vercel: `FIREBASE_PROJECT_ID` and `GOOGLE_CLOUD_PROJECT_ID`
   - Google Cloud: The project where you added the roles

