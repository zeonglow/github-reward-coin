# 🚀 Testing Supabase Functions Locally - Complete Guide

## ✅ **Server is Working!**

Your Deno server is now properly configured and running. Here's how to use it:

## 🔧 **Quick Start**

### 1. **Set Environment Variables**

Create a `.env.local` file in the `apps/dashboard` directory:

```bash
# Supabase Configuration
SUPABASE_URL=your_actual_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### 2. **Start the Server**

```bash
# From project root
yarn server
# or
./scripts/start-server.sh
```

### 3. **Start Your Frontend**

```bash
# In another terminal
cd apps/dashboard
npm run dev
```

## 🧪 **Testing the Complete Flow**

1. **Server Health Check**: http://localhost:54321/functions/v1/connect
2. **GitHub OAuth**: http://localhost:54321/functions/v1/connect/github
3. **Frontend**: http://localhost:3000

## 🎯 **What's Fixed**

✅ **Deno Configuration**: Proper `deno.json` with imports  
✅ **Dependencies**: All npm and JSR packages installed  
✅ **Server Running**: Health endpoint responding  
✅ **CORS Enabled**: Ready for frontend integration  
✅ **GitHub OAuth**: Complete OAuth flow implemented

## 🔄 **Complete GitHub OAuth Flow**

1. **User clicks "Connect GitHub"** in your React app
2. **Frontend redirects** to `http://localhost:54321/functions/v1/connect/github`
3. **Server redirects** to GitHub OAuth
4. **GitHub redirects back** to `http://localhost:54321/functions/v1/connect/github/callback`
5. **Server processes OAuth** and saves to Supabase
6. **Server redirects** to `http://localhost:3000?github_connected=true`
7. **Frontend shows success toast** and switches to developer view

## 🛠️ **Available Endpoints**

- `GET /make-server-b1e42adc/health` - Health check
- `GET /connect/github` - Start GitHub OAuth
- `GET /connect/github/callback` - GitHub OAuth callback

## 🐛 **Troubleshooting**

### If server won't start:

```bash
# Check Deno is installed
deno --version

# Reinstall dependencies
deno install

# Check environment variables
echo $SUPABASE_URL
```

### If CORS issues:

- Server already has CORS enabled for all origins
- Make sure frontend is running on http://localhost:3000

### If GitHub OAuth fails:

- Check your GitHub OAuth app redirect URI is: `http://localhost:54321/functions/v1/connect/github/callback`
- Verify your GitHub client ID and secret

## 🎉 **You're Ready!**

Your server is now properly configured and running. Just add your real environment variables and you can test the complete GitHub OAuth flow!
