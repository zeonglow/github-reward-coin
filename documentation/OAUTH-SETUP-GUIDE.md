# 🔧 GitHub OAuth Setup Guide

## ❌ **Issue Found: Missing Environment Variables**

The `oauth_initiation_failed` error is caused by missing environment variables. Here's how to fix it:

## 🚀 **Step 1: Create GitHub OAuth App**

1. **Go to GitHub Settings**: https://github.com/settings/applications/new
2. **Fill in the form**:
   - **Application name**: `GitHub Reward Coin Local`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:54321/functions/v1/connect/github/callback`
3. **Click "Register application"**
4. **Copy the Client ID and Client Secret**

## 🚀 **Step 2: Get Supabase Credentials**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Copy**:
   - **Project URL** (SUPABASE_URL)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

## 🚀 **Step 3: Create Environment File**

Create a `.env.local` file in `apps/dashboard/`:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

## 🚀 **Step 4: Restart Server with Environment Variables**

```bash
cd apps/dashboard
source .env.local
./start-server.sh
```

## 🧪 **Step 5: Test the Setup**

1. **Run debug script**:

   ```bash
   ./debug-oauth.sh
   ```

2. **Test OAuth flow**:
   - Go to http://localhost:3000
   - Click "Connect GitHub"
   - You should be redirected to GitHub for authorization

## 🔍 **Common Issues & Solutions**

### ❌ **"oauth_initiation_failed"**

- **Cause**: Missing environment variables
- **Fix**: Create `.env.local` file with real values

### ❌ **"Invalid redirect_uri"**

- **Cause**: GitHub OAuth app redirect URI doesn't match
- **Fix**: Set redirect URI to `http://localhost54321/functions/v1/connect/github/callback`

### ❌ **"Client authentication failed"**

- **Cause**: Wrong GitHub client ID/secret
- **Fix**: Double-check your GitHub OAuth app credentials

### ❌ **"Database error"**

- **Cause**: Wrong Supabase credentials or missing table
- **Fix**: Check Supabase URL and service role key

## 🎯 **Quick Checklist**

- [ ] GitHub OAuth app created with correct redirect URI
- [ ] `.env.local` file created with real values
- [ ] Server restarted with environment variables
- [ ] Debug script shows all variables set
- [ ] OAuth flow works end-to-end

## 🚀 **Ready to Test!**

Once you've set up the environment variables, your GitHub OAuth should work perfectly! 🎉
