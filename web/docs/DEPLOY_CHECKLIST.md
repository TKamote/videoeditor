# 🚀 Vercel Deployment Checklist

## ✅ Ready to Deploy

Your app is **ready for Vercel deployment**! Here's what you need to know:

### What Works Without Configuration:
- ✅ Frontend UI (all pages)
- ✅ Authentication (login/signup)
- ✅ Email verification
- ✅ Firebase client-side features
- ✅ Theme switching
- ✅ All UI components

### What Needs Environment Variables:
- ⚠️ API routes (video processing)
- ⚠️ Backend features (GCS, Video Intelligence, Gemini)

---

## 📋 Deployment Steps

### 1. Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. **Important**: Set **Root Directory** to `web`
5. Framework Preset: Next.js (auto-detected)
6. Click "Deploy"

**Option B: Vercel CLI**
```bash
cd web
npm i -g vercel
vercel login
vercel
# When asked for root directory, enter: web
```

### 2. Add Environment Variables (After First Deploy)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **Server-side** variables (for API routes):

```
FIREBASE_PROJECT_ID=videoeditor-2508b
FIREBASE_CLIENT_EMAIL=your-service-account@videoeditor-2508b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GOOGLE_CLOUD_PROJECT_ID=videoeditor-2508b
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@videoeditor-2508b.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GCS_BUCKET_NAME=your-bucket-name

GEMINI_API_KEY=your_gemini_api_key

CLOUD_RUN_WORKER_URL=https://your-worker-url.run.app
```

**Note**: 
- Firebase client config is hardcoded (no `NEXT_PUBLIC_*` vars needed)
- Private keys must include quotes and `\n` characters

### 3. Update Firebase Authorized Domains

After deployment:
1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain: `your-app.vercel.app`
3. Also add custom domain if you have one

### 4. Redeploy

After adding environment variables:
- Vercel will auto-redeploy, OR
- Go to Deployments → Redeploy

---

## 🔍 How to Get Service Account Keys

### Firebase Admin Key:
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON
4. Extract: `project_id`, `client_email`, `private_key`

### Google Cloud Key:
1. Google Cloud Console → IAM & Admin → Service Accounts
2. Create service account with roles:
   - Storage Admin
   - Video Intelligence API User
3. Create JSON key
4. Extract same fields

---

## ✅ Post-Deployment Testing

1. **Test Authentication**:
   - Visit your Vercel URL
   - Try signup/login
   - Check email verification

2. **Test UI**:
   - Verify dark/light mode works
   - Check mobile responsiveness
   - Test all pages load

3. **Test Backend** (after adding env vars):
   - Try uploading a video
   - Check API routes work

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies in `package.json`
- Verify TypeScript compiles

### API Routes Return 500
- Check environment variables are set
- Verify service account keys are correct
- Check Vercel function logs

### Auth Not Working
- Verify Firebase authorized domains
- Check Firebase console for errors
- Ensure Firebase config is correct

---

## 📝 Current Status

**✅ Ready**: Frontend, Auth, UI  
**⚠️ Needs Config**: Backend API routes (add env vars after deployment)

**You can deploy now!** The app will work for frontend features. Add backend env vars when ready to test video processing.

