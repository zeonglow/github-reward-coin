#!/bin/bash

# Debug script for GitHub OAuth issues
export PATH="$HOME/.deno/bin:$PATH"

# Navigate to project root
cd "$(dirname "$0")/.."

echo "🔍 Debugging GitHub OAuth Setup"
echo "=============================="

# Check if server is running
echo "1. Checking if server is running..."
if curl -s http://localhost:54321/functions/v1/connect > /dev/null; then
    echo "✅ Server is running on port 54321"
else
    echo "❌ Server not running on port 54321, checking other ports..."
    for port in 8001 8002 8003; do
        if curl -s http://localhost:$port/functions/v1/connect > /dev/null; then
            echo "✅ Server is running on port $port"
            break
        fi
    done
fi

echo ""
echo "2. Checking environment variables..."
echo "SUPABASE_URL: ${SUPABASE_URL:-❌ NOT SET}"
echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:-❌ NOT SET}"
echo "GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID:-❌ NOT SET}"
echo "GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET:-❌ NOT SET}"
echo "FRONTEND_URL: ${FRONTEND_URL:-❌ NOT SET}"

echo ""
echo "3. Testing GitHub OAuth endpoint..."
echo "Testing: http://localhost:54321/functions/v1/connect/github"
curl -I http://localhost:54321/functions/v1/connect/github 2>/dev/null | head -1 || echo "❌ OAuth endpoint not responding"

echo ""
echo "4. Common issues to check:"
echo "   - GitHub OAuth app redirect URI should be: http://localhost:54321/functions/v1/connect/github/callback"
echo "   - Environment variables must be set correctly"
echo "   - Server must be running"
echo "   - GitHub OAuth app must be configured properly"

echo ""
echo "5. To fix:"
echo "   - Create .env.local file with your actual values"
echo "   - Restart server with: ./start-server.sh"
echo "   - Check GitHub OAuth app settings"
