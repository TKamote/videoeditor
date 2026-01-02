# Automatic GitHub → Vercel Deployment Setup

## ✅ What You've Done
- Added project to Vercel
- Repository is on GitHub: `TKamote/videoeditor`

## 🔧 Configure Automatic Deployments

### Step 1: Verify Vercel Project Settings

1. Go to your Vercel project dashboard
2. Click **Settings** → **Git**
3. Verify:
   - ✅ Connected Repository: `TKamote/videoeditor`
   - ✅ Production Branch: `main`
   - ✅ Root Directory: `web` ⚠️ **IMPORTANT**
   - ✅ Framework Preset: Next.js

### Step 2: Enable Automatic Deployments

In Vercel Dashboard → Settings → Git:

1. **Production Branch**: Should be `main`
2. **Auto-deploy**: Should be **ON** (default)
3. **Preview Deployments**: Enable for pull requests (optional but recommended)

### Step 3: Configure Build Settings

In Vercel Dashboard → Settings → General:

- **Root Directory**: `web` ⚠️ **CRITICAL - Must be set!**
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)
- **Node.js Version**: 20.x (recommended)

### Step 4: Test Automatic Deployment

1. Make a small change to any file (e.g., add a comment)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. Go to Vercel Dashboard → Deployments
4. You should see a new deployment start automatically!

## 🎯 How It Works

- **Push to `main` branch** → Automatic production deployment
- **Create Pull Request** → Automatic preview deployment
- **Merge PR** → Automatic production deployment

## 📋 Verification Checklist

After setup, verify:

- [ ] Root Directory is set to `web` in Vercel
- [ ] Repository is connected in Vercel Settings → Git
- [ ] Auto-deploy is enabled
- [ ] Test push triggers a deployment

## 🐛 Troubleshooting

### Deployment Fails
- Check Vercel build logs
- Verify Root Directory is `web`
- Check for TypeScript/build errors

### Wrong Files Deployed
- Verify Root Directory is `web` (not root)
- Check `.vercelignore` if files are being excluded

### Not Auto-Deploying
- Check Vercel Settings → Git → Auto-deploy is ON
- Verify GitHub webhook is connected
- Check GitHub repository settings → Webhooks

## 📝 Next Steps

1. ✅ Verify Root Directory is `web`
2. ✅ Test with a small commit
3. ✅ Add environment variables when ready
4. ✅ Update Firebase authorized domains

Your deployments will now happen automatically on every push! 🚀

