# 🔧 Environment Setup Guide

## ❌ **Current Issue: DNS Error**

The error you're seeing:

```
failed to lookup address information: nodename nor servname provided, or not known
```

This happens because the server is using placeholder environment variables (`https://example.supabase.co`) instead of real ones.

## 🚀 **Quick Fix**

### **Step 1: Create Environment File**

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# GitHub OAuth Configuration (REQUIRED)
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### **Step 2: Get Real Credentials**

#### **Supabase Credentials:**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

#### **GitHub OAuth Credentials:**

1. Go to: https://github.com/settings/applications/new
2. Fill in:
   - **Application name**: `GitHub Reward Coin`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8000/connect/github/callback`
3. Copy:
   - **Client ID** → `GITHUB_CLIENT_ID`
   - **Client Secret** → `GITHUB_CLIENT_SECRET`

### **Step 3: Restart Server**

```bash
# Stop current server
yarn server:stop

# Start with real environment variables
yarn server
```

## 🧪 **Test the Fix**

```bash
# Test OAuth endpoint
curl -I http://localhost:8000/connect/github

# Should redirect to GitHub (not show DNS error)
```

## ⚠️ **Common Issues**

### **"DNS error: failed to lookup address"**

- **Cause**: Using placeholder URLs like `example.supabase.co`
- **Fix**: Use real Supabase project URL

### **"Invalid redirect_uri"**

- **Cause**: GitHub OAuth app redirect URI doesn't match
- **Fix**: Set redirect URI to `http://localhost:8000/connect/github/callback`

### **"Client authentication failed"**

- **Cause**: Wrong GitHub client ID/secret
- **Fix**: Double-check your GitHub OAuth app credentials

## 🎯 **Quick Checklist**

- [ ] Created `.env.local` with real values
- [ ] Supabase URL is real (not example.supabase.co)
- [ ] GitHub OAuth app created with correct redirect URI
- [ ] Server restarted with new environment variables
- [ ] OAuth endpoint redirects to GitHub (no DNS errors)

## 🚀 **Ready to Test!**

Once you have real environment variables, the OAuth flow will work perfectly! 🎉
