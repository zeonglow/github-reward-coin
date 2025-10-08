#!/bin/bash

# Test script for running the Supabase function locally
export PATH="$HOME/.deno/bin:$PATH"

# Navigate to project root
cd "$(dirname "$0")/.."

# Set environment variables (you'll need to replace these with your actual values)
export SUPABASE_URL="https://uvkwcralkuwqocgsmcap.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="somekey"
export GITHUB_CLIENT_ID="your_github_client_id"
export GITHUB_CLIENT_SECRET="your_github_client_secret"
export FRONTEND_URL="http://localhost:3000"
export VITE_SERVER_URL="http://localhost:8000"

echo "🚀 Starting Supabase function server locally..."
echo "📍 Server will be available at: http://localhost:8000"
echo "🔗 GitHub OAuth endpoint: http://localhost:8000/connect/github"
echo ""

# Run the server
deno run --allow-net --allow-env --allow-read --allow-write apps/dashboard/src/supabase/functions/server/index.tsx
