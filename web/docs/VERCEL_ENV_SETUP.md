# 🔐 Vercel Environment Variables Setup

## How to Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in and select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Add Each Variable**
   - Click **Add New**
   - Enter the variable name and value
   - Select **Production**, **Preview**, and **Development** (or as needed)
   - Click **Save**

---

## 📋 Required Environment Variables

### Firebase Admin (Server-side)
```
FIREBASE_PROJECT_ID=videoeditor-2508b
FIREBASE_CLIENT_EMAIL=your-service-account@videoeditor-2508b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important for FIREBASE_PRIVATE_KEY:**
- Keep the quotes around the entire value
- Keep the `\n` characters (they represent newlines)
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Google Cloud Storage (Server-side)
```
GOOGLE_CLOUD_PROJECT_ID=videoeditor-2508b
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@videoeditor-2508b.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GCS_BUCKET_NAME=your-gcs-bucket-name
```

**Note:** You can use the same service account credentials for both Firebase Admin and GCS if they're from the same project.

### AI Services (Server-side)
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Cloud Run Worker (Server-side)
```
CLOUD_RUN_WORKER_URL=https://your-worker-url-xxxx-uc.a.run.app
```

**Note:** This is optional if you haven't deployed the Cloud Run worker yet. The app will work but video rendering won't be available.

---

## ✅ What You DON'T Need

Since Firebase client config is hardcoded in the code, you **DO NOT** need:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## 🔄 After Adding Variables

1. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**

   OR

   - Vercel will auto-redeploy when you add new environment variables

2. **Verify** the deployment:
   - Check the build logs to ensure no errors
   - Test your API routes to confirm they work

---

## 🚨 Common Issues

### Private Key Format
If you get errors about the private key:
- Make sure it's wrapped in quotes: `"-----BEGIN..."`
- Keep the `\n` characters (don't replace with actual newlines)
- Include the full key from `-----BEGIN` to `-----END`

### Missing Variables
If API routes fail:
- Check that all server-side variables are set
- Ensure they're enabled for **Production** environment
- Redeploy after adding variables

---

## 📝 Quick Checklist

- [ ] `FIREBASE_PROJECT_ID` added
- [ ] `FIREBASE_CLIENT_EMAIL` added
- [ ] `FIREBASE_PRIVATE_KEY` added (with quotes and `\n`)
- [ ] `GOOGLE_CLOUD_PROJECT_ID` added
- [ ] `GOOGLE_CLOUD_CLIENT_EMAIL` added
- [ ] `GOOGLE_CLOUD_PRIVATE_KEY` added (with quotes and `\n`)
- [ ] `GCS_BUCKET_NAME` added
- [ ] `GEMINI_API_KEY` added
- [ ] `CLOUD_RUN_WORKER_URL` added (optional)
- [ ] Project redeployed
- [ ] Build successful
- [ ] API routes tested

---

## 💡 Where to Find Your Values

### Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Project Settings** → **Service Accounts**
3. Click **Generate New Private Key**
4. Download the JSON file
5. Extract:
   - `project_id` → `FIREBASE_PROJECT_ID` and `GOOGLE_CLOUD_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL` and `GOOGLE_CLOUD_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` and `GOOGLE_CLOUD_PRIVATE_KEY`

### GCS Bucket Name
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Cloud Storage** → **Buckets**
3. Copy your bucket name → `GCS_BUCKET_NAME`

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or copy your API key → `GEMINI_API_KEY`

### Cloud Run Worker URL
1. Deploy your Cloud Run service (see `cloud-run/` directory)
2. Copy the service URL → `CLOUD_RUN_WORKER_URL`

