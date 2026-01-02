# Environment Variables Setup Guide

## Common Issues with Next.js Environment Variables

### Issue 1: File is Empty or Not Saved
- Make sure `.env.local` is saved with actual content
- Check file size: `ls -lh .env.local` (should not be 0 bytes)

### Issue 2: Dev Server Not Restarted
**CRITICAL**: After creating/modifying `.env.local`, you MUST:
1. Stop the dev server (Ctrl+C)
2. Restart it: `npm run dev`

Next.js only reads `.env.local` when the server starts!

### Issue 3: Wrong File Location
`.env.local` must be at the **root** of your Next.js project (same level as `package.json`):
```
web/
├── .env.local          ← HERE (correct)
├── package.json
├── next.config.mjs
└── src/
```

### Issue 4: Syntax Errors
- No spaces around `=`
- No quotes needed (unless value contains spaces)
- No trailing commas
- Each variable on its own line

**Correct:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample123
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-project-id
```

**Wrong:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyExample123  # ❌ Spaces around =
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyExample123"  # ❌ Unnecessary quotes
```

### Issue 5: Client-Side Variables Must Have `NEXT_PUBLIC_` Prefix
Only variables prefixed with `NEXT_PUBLIC_` are available in client components.

## Quick Debug Steps

1. **Verify file exists and has content:**
   ```bash
   cd web
   ls -lh .env.local
   cat .env.local
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for "🔍 Firebase Env Check" log
   - This shows which variables are missing

3. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Verify Next.js is reading the file:**
   - Check terminal output when starting `npm run dev`
   - Should see "Loaded env from .env.local" (Next.js 13+)

## Template for `.env.local`

Create this file at `web/.env.local`:

```env
# Frontend (Required for app to run)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Backend (Needed for API routes)
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"

GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_CLOUD_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
GCS_BUCKET_NAME=your_bucket_name

GEMINI_API_KEY=your_gemini_key_here
CLOUD_RUN_WORKER_URL=https://your-worker-url.run.app
```

## Still Not Working?

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check for typos:**
   - Variable names are case-sensitive
   - Must match exactly: `NEXT_PUBLIC_FIREBASE_API_KEY` (not `NEXT_PUBLIC_FIREBASE_APIKEY`)

3. **Verify in code:**
   - Open browser console
   - Look for the debug log showing which env vars are set/missing

