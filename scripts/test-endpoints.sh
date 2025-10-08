#!/bin/bash

# Test script to verify your Supabase function endpoints
export PATH="$HOME/.deno/bin:$PATH"

# Navigate to project root
cd "$(dirname "$0")/.."

echo "🧪 Testing Supabase Function Endpoints"
echo "======================================"

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:8000/make-server-b1e42adc/health
echo -e "\n"

# Test GitHub OAuth endpoint (this will redirect, so we just check if it responds)
echo "2. Testing GitHub OAuth endpoint..."
echo "   This should redirect to GitHub (you can cancel the redirect)"
curl -I http://localhost:8000/connect/github
echo -e "\n"

echo "✅ If you see JSON responses above, your server is working!"
echo "🔗 Frontend should connect to: http://localhost:8000/connect/github"
