# Testing Supabase Functions Locally

## 🚀 Method 1: Direct Deno Server (Recommended)

### Step 1: Set up environment variables

Create a `.env.local` file in the dashboard directory:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Frontend Configuration
VITE_SERVER_URL=http://localhost:54321
FRONTEND_URL=http://localhost:3000
```

### Step 2: Run the server

```bash
cd apps/dashboard
export PATH="$HOME/.deno/bin:$PATH"
source .env.local
deno run --allow-net --allow-env --allow-read --allow-write src/supabase/functions/server/index.tsx
```

### Step 3: Test the endpoints

- Health check: http://localhost:54321/functions/v1/connect
- GitHub OAuth: http://localhost:54321/functions/v1/connect/github

## 🚀 Method 2: Using Supabase CLI

### Step 1: Initialize Supabase project

```bash
cd apps/dashboard
supabase init
```

### Step 2: Start local development

```bash
supabase start
```

### Step 3: Deploy functions locally

```bash
supabase functions serve --env-file .env.local
```

## 🚀 Method 3: Using the test script

### Step 1: Update the test script with your environment variables

Edit `test-server.sh` and replace the placeholder values with your actual credentials.

### Step 2: Run the test script

```bash
cd apps/dashboard
./test-server.sh
```

## 🧪 Testing the GitHub OAuth Flow

1. **Start your frontend**: `npm run dev` (runs on http://localhost:3000)
2. **Start your server**: Use any of the methods above (runs on http://localhost:54321)
3. **Test the flow**:
   - Go to http://localhost:3000
   - Click "Connect GitHub"
   - You'll be redirected to GitHub for OAuth
   - After authorization, you'll be redirected back to your app
   - Check the toast notification for success/error

## 🔧 Environment Variables You Need

### Supabase

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key from Supabase dashboard

### GitHub OAuth

- `GITHUB_CLIENT_ID`: From your GitHub OAuth app
- `GITHUB_CLIENT_SECRET`: From your GitHub OAuth app

### URLs

- `VITE_SERVER_URL`: Where your server runs (usually http://localhost:54321)
- `FRONTEND_URL`: Where your React app runs (usually http://localhost:3000)

## 🐛 Troubleshooting

### Common Issues:

1. **CORS errors**: Make sure your server has CORS enabled (it does)
2. **Environment variables not loaded**: Make sure to source your .env.local file
3. **Deno permissions**: Use the `--allow-*` flags as shown above
4. **GitHub OAuth redirect**: Make sure your GitHub OAuth app redirect URI matches your server callback URL

### Debug Commands:

```bash
# Check if server is running
curl http://localhost:54321/functions/v1/connect

# Test GitHub OAuth flow
curl -L http://localhost:54321/functions/v1/connect/github

# Check environment variables
echo $SUPABASE_URL
echo $GITHUB_CLIENT_ID
```
