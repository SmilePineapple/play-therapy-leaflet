# Vercel Environment Variables Setup

## 🚨 URGENT: Fix for Login Issues

Your app is currently using **mock authentication** because the Supabase environment variables are not configured in Vercel.

## 🔧 How to Fix

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Login to your account
3. Find your `communication-matters` project
4. Click on the project name

### Step 2: Add Environment Variables
1. Click on **Settings** tab
2. Click on **Environment Variables** in the sidebar
3. Add the following variables:

#### Required Variables:
```
REACT_APP_SUPABASE_URL
https://corcfxmrkhugmyqmbqkh.supabase.co
```

```
REACT_APP_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcmNmeG1ya2h1Z215cW1icWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTEzMzQsImV4cCI6MjA2NzAyNzMzNH0.XIXjMDS14P5s8NSdNmr9QgZvBedt7ST_aFXoai5erCE
```

#### Optional Variables:
```
REACT_APP_DEBUG
true
```

```
REACT_APP_LOG_LEVEL
debug
```

### Step 3: Redeploy
1. After adding the environment variables, go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Wait for the deployment to complete

## 🎯 What This Fixes

- ✅ **Real Supabase Authentication** (instead of mock)
- ✅ **Admin Login Functionality**
- ✅ **Add to Agenda Feature**
- ✅ **Database Connectivity**
- ✅ **Real-time Updates**
- ✅ **Question Submission**
- ✅ **Announcement Management**

## 🔍 How to Verify

After redeployment, check the browser console:
- ❌ **Before**: `🔧 Mock auth.getSession called`
- ✅ **After**: `✅ Supabase client initialized successfully`

## 📱 Alternative: Quick CLI Method

```bash
# From your project directory
vercel env add REACT_APP_SUPABASE_URL
# Enter: https://corcfxmrkhugmyqmbqkh.supabase.co

vercel env add REACT_APP_SUPABASE_ANON_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcmNmeG1ya2h1Z215cW1icWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTEzMzQsImV4cCI6MjA2NzAyNzMzNH0.XIXjMDS14P5s8NSdNmr9QgZvBedt7ST_aFXoai5erCE

# Redeploy
vercel --prod
```

## 🚨 Important Notes

1. **Environment variables are case-sensitive**
2. **No quotes needed** when entering values in Vercel dashboard
3. **Redeploy is required** for changes to take effect
4. **Test immediately** after redeployment

---

**Once configured, your app will connect to the real Supabase database and all features will work properly!**