# Vercel Deployment Guide

## Pre-Deployment Checklist

### ✅ What's Ready
- ✅ Next.js app configured
- ✅ Firebase client config hardcoded (works for frontend)
- ✅ Authentication system implemented
- ✅ UI components ready
- ✅ Build scripts configured

### ⚠️ What Needs Configuration

## Step 1: Environment Variables in Vercel

You need to add these environment variables in Vercel Dashboard:

### Required for API Routes (Server-side)

1. **Firebase Admin** (for server-side operations):
   ```
   FIREBASE_PROJECT_ID=videoeditor-2508b
   FIREBASE_CLIENT_EMAIL=your-service-account@videoeditor-2508b.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. **Google Cloud Storage** (for Video Intelligence API):
   ```
   GOOGLE_CLOUD_PROJECT_ID=videoeditor-2508b
   GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@videoeditor-2508b.iam.gserviceaccount.com
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GCS_BUCKET_NAME=your-gcs-bucket-name
   ```

3. **AI APIs**:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Cloud Run Worker** (optional - add when ready):
   ```
   CLOUD_RUN_WORKER_URL=https://your-worker-url.run.app
   ```

### Note on Firebase Client Config
- The Firebase client config is hardcoded in `firebase.ts` (this is fine for public-facing config)
- No `NEXT_PUBLIC_*` env vars needed since it's hardcoded

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Set Root Directory to `web`
5. Add all environment variables listed above
6. Click "Deploy"

### Option B: Via Vercel CLI
```bash
cd web
npm i -g vercel
vercel login
vercel
# Follow prompts, set root directory to "web"
# Add environment variables when prompted
```

## Step 3: Post-Deployment

### 1. Update Firebase Authorized Domains
- Go to Firebase Console → Authentication → Settings
- Add your Vercel domain to "Authorized domains"
- Example: `your-app.vercel.app`

### 2. Test the Deployment
- Visit your Vercel URL
- Test login/signup
- Test email verification
- Test file upload (if backend is configured)

## Step 4: Get Service Account Keys

### Firebase Admin Service Account
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n)

### Google Cloud Service Account
1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Create or select service account
3. Grant roles: Storage Admin, Video Intelligence API User
4. Create JSON key
5. Extract same fields as above

## Important Notes

⚠️ **Security**:
- Never commit `.env.local` or service account keys to Git
- All sensitive keys should only be in Vercel environment variables
- The hardcoded Firebase client config is safe (it's meant to be public)

⚠️ **API Routes**:
- API routes will fail if env vars are not set
- The app will still work for frontend features (login, UI)
- Backend features (video processing) need all env vars

⚠️ **Build**:
- Make sure to test build locally: `npm run build`
- Check for any TypeScript errors
- Ensure all imports are correct

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Ensure all dependencies are in `package.json`
- Check for missing imports

### API Routes Return 500
- Verify all environment variables are set in Vercel
- Check Vercel function logs
- Ensure service account keys are correctly formatted

### Authentication Not Working
- Verify Firebase authorized domains include Vercel URL
- Check Firebase console for errors
- Verify Firebase config is correct

## Current Status

✅ **Ready to Deploy:**
- Frontend is ready
- Authentication system works
- UI is complete

⚠️ **Needs Configuration:**
- Backend API routes need environment variables
- Video processing features need GCS and API keys
- Cloud Run worker URL (when ready)

You can deploy now and add environment variables later. The frontend will work, but backend features will need the env vars.

