# 🔧 GitHub OAuth Callback URL Fix

## ❌ **Current Issue**

GitHub OAuth app callback URL doesn't match your local server:

- **GitHub OAuth app callback**: `https://uvkwcralkuwqocgsmcap.supabase.co/auth/v1/callback`
- **Your server expects**: `http://localhost:8000/connect/github/callback`

## 🚀 **Solution 1: Update GitHub OAuth App (Recommended for Local Development)**

### **Step 1: Go to GitHub OAuth App Settings**

1. Visit: https://github.com/settings/applications
2. Find your OAuth app
3. Click on it to edit

### **Step 2: Update Callback URL**

- **Change from**: `https://uvkwcralkuwqocgsmcap.supabase.co/auth/v1/callback`
- **Change to**: `http://localhost:8000/connect/github/callback`
- **Save changes**

### **Step 3: Test the Fix**

```bash
# Start server
yarn server

# Test OAuth flow
curl -I http://localhost:8000/connect/github
# Should redirect to GitHub without callback errors
```

## 🚀 **Solution 2: Use Supabase Edge Functions (Production)**

If you want to use Supabase's built-in OAuth handling:

### **Step 1: Keep Current Callback URL**

- **Keep**: `https://uvkwcralkuwqocgsmcap.supabase.co/auth/v1/callback`

### **Step 2: Deploy to Supabase Edge Functions**

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref uvkwcralkuwqocgsmcap

# Deploy the function
supabase functions deploy github-oauth
```

### **Step 3: Update Frontend to Use Supabase OAuth**

Instead of your local server, use Supabase's OAuth:

```typescript
// In your frontend
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "github",
  options: {
    redirectTo: "http://localhost:3000", // Your frontend URL
  },
});
```

## 🎯 **Recommended Approach**

### **For Local Development:**

- ✅ **Use Solution 1** - Update GitHub OAuth app callback URL
- ✅ **Keep using your local server** - Full control over OAuth flow
- ✅ **Easy to debug and test**

### **For Production:**

- ✅ **Use Solution 2** - Deploy to Supabase Edge Functions
- ✅ **Use Supabase's built-in OAuth** - More reliable
- ✅ **Better for scaling**

## 🧪 **Testing the Fix**

### **After updating GitHub OAuth app:**

1. **Start server**: `yarn server`
2. **Test OAuth**: Go to `http://localhost:8000/connect/github`
3. **Should redirect to GitHub** without callback errors
4. **After GitHub authorization** - should redirect back to your app

### **Expected Flow:**

1. User clicks "Connect GitHub"
2. Redirects to GitHub OAuth
3. User authorizes on GitHub
4. GitHub redirects to `http://localhost:8000/connect/github/callback`
5. Your server processes the OAuth callback
6. Redirects to frontend with success/error

## ⚠️ **Common Issues**

### **"Redirect URI mismatch"**

- **Cause**: GitHub OAuth app callback URL doesn't match server expectation
- **Fix**: Update GitHub OAuth app callback URL

### **"Invalid redirect_uri"**

- **Cause**: Callback URL not properly configured
- **Fix**: Double-check the callback URL in GitHub OAuth app

### **"Application not found"**

- **Cause**: Wrong GitHub OAuth app or client ID
- **Fix**: Verify you're using the correct OAuth app

## 🎉 **Ready to Test!**

Once you update the GitHub OAuth app callback URL, your OAuth flow will work perfectly! 🚀
