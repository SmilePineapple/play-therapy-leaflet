# GitHub Integration with Vercel - Communication Matters Project

🎉 **GREAT NEWS!** Your Communication Matters project is already deployed on Vercel at:
**https://communication-matters.vercel.app**

## Overview
This guide will help you connect your existing "Communication Matters" Vercel project to GitHub for automatic deployments.

**⚠️ IMPORTANT CLARIFICATION**: 
- **GitHub Repository**: `SmilePineapple/play-therapy-leaflet` 
- **Actual Project**: Communication Matters AAC Conference App
- **Why the mismatch?**: The repository was originally created for a different project but now contains the Communication Matters application code. This is the correct repository to use for your Communication Matters project.

**Project Details**:
- **Package Name**: `communication-matters-conference`
- **Description**: Accessible web app for Communication Matters AAC Conference
- **Current Vercel Project**: `communication-matters`

## Current Status ✅
- ✅ **Vercel Project:** `communication-matters` (ID: `prj_0C6MqijxilF7V4cjify6yppZ1trU`)
- ✅ **Production URL:** https://communication-matters.vercel.app
- ✅ **GitHub Repository:** `git@github.com:SmilePineapple/play-therapy-leaflet.git`
- ✅ **Local Project:** Linked to Vercel project
- ✅ **Latest Code:** Pushed to GitHub
- ✅ **Build Configuration:** React app with npm build

**Note:** Your repository is named `play-therapy-leaflet` but contains the Communication Matters application code.

## Step-by-Step Setup

### Option 1: Connect Existing Project to GitHub (Recommended)

#### 1. Access Your Project Settings
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find and click on your **"communication-matters"** project
3. Click **"Settings"** tab
4. Navigate to **"Git"** section

#### 2. Connect to GitHub Repository
1. In the Git section, click **"Connect Git Repository"**
2. Select **"GitHub"** as your Git provider
3. If prompted, authorize Vercel to access your GitHub account
4. Search for and select: `SmilePineapple/play-therapy-leaflet`
   - ⚠️ **Yes, this is correct!** Even though the name says "play-therapy-leaflet", this repository contains your Communication Matters project
5. Click **"Connect"**

#### 3. Configure Branch Settings
**Note**: If you don't see branch configuration options immediately, they may appear after connecting the repository.

1. **Production Branch**: Should automatically detect `main` as the default branch
   - If not visible initially, check the **Settings** tab after connection
   - Look for **Git** or **Domains** section for branch settings
2. **Automatic Deployments**: Should be enabled by default for the main branch
3. **Preview Deployments**: Optionally enable for pull requests
4. Click **"Save"** or **"Update"** if changes are made

### Option 2: Create New Project from GitHub (Alternative)

If Option 1 doesn't work, you can create a fresh project:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `SmilePineapple/play-therapy-leaflet`
   - ⚠️ **Confirm**: This repository contains your Communication Matters project despite the name
4. **Configure Project**:
   - **Project Name**: Change to `communication-matters-github` (to avoid conflicts)
   - **Framework Preset**: React
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
   - **Production Branch**: `main` (should be auto-detected)
5. Deploy
6. Delete the old project if needed

## Troubleshooting

### "Can't find branch settings"
- Branch settings may appear in the **Settings** tab after initial connection
- Look under **Git**, **Domains**, or **General** sections
- The production branch is usually auto-detected as `main`

### "Wrong repository selected"
- **Confirm**: `SmilePineapple/play-therapy-leaflet` is correct
- This repository contains your Communication Matters AAC Conference App
- The repository name is misleading but the content is correct

### "Build fails after connection"
- Ensure your `.env` variables are set in Vercel project settings
- Check that `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are configured

### 4. Verify Configuration
**Framework Preset:** React
**Build Command:** `npm run build`
**Output Directory:** `build`
**Install Command:** `npm install`

### 4. Environment Variables (if needed)
If your app uses environment variables:
1. In the import screen, expand **"Environment Variables"**
2. Add any required variables (e.g., `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`)
3. You can also add these later in Project Settings

### 5. Deploy
1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build your React app
   - Deploy to a production URL

## Benefits of GitHub Integration 🚀

### ✅ **Current Status**
- Your app is **already live** at https://communication-matters.vercel.app
- Manual deployments are working via CLI
- Project is properly configured

### ✅ **What GitHub Integration Adds**
- **Automatic Deployments:** Every push to `main` triggers deployment
- **No Upload Limits:** Bypass the 5000 files/day CLI limit
- **Preview Deployments:** Each pull request gets a preview URL
- **Easy Rollbacks:** One-click rollback to any previous version
- **Team Collaboration:** Share preview URLs with stakeholders
- **Git History:** Track deployments with your commit history

### ✅ **Immediate Benefits**
- No more "Too many requests" errors
- Faster deployment process
- Automatic builds on code changes
- Better development workflow

## Post-Setup Configuration

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings

### Build & Development Settings
- **Node.js Version:** 18.x (recommended)
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm ci`

### Environment Variables
Add these in Project Settings → Environment Variables:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Build Failures
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify build command works locally: `npm run build`

### Environment Variables
1. Make sure all required env vars are set
2. Use `REACT_APP_` prefix for client-side variables
3. Redeploy after adding new variables

### GitHub Permissions
1. If repository not visible, check GitHub App permissions
2. Grant Vercel access to specific repositories
3. Re-import if needed

## Current Project Status
- **Project:** Communication Matters Application
- **Repository:** `SmilePineapple/play-therapy-leaflet` (repository name differs from project name)
- **Main Branch:** `main`
- **Latest Commit:** Added .vercelignore for optimized deployments
- **Ready for Integration:** ✅

## Next Steps
1. Follow the setup steps above
2. Test the deployment
3. Configure any additional settings
4. Enjoy automatic deployments! 🚀

---

**Note:** This method bypasses the Vercel CLI upload limits and provides a more robust deployment pipeline.