#!/bin/bash

# Script to start the Supabase function server with automatic port handling
export PATH="$HOME/.deno/bin:$PATH"

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔄 Killing existing process on port $port (PID: $pid)"
        kill -9 $pid
        sleep 1
    fi
}

# Function to find available port
find_available_port() {
    local port=$1
    while lsof -ti:$port > /dev/null 2>&1; do
        port=$((port + 1))
    done
    echo $port
}

# Default port
DEFAULT_PORT=8000
PORT=${1:-$DEFAULT_PORT}

echo "🚀 Starting Supabase Function Server"
echo "=================================="

# Kill any existing process on the port
#kill_port $PORT

# Check if port is still in use, if so find another
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Port $PORT is still in use, finding alternative..."
    PORT=$(find_available_port $PORT)
    echo "📍 Using port $PORT instead"
fi

export SUPABASE_URL="${SUPABASE_URL:-https://uvkwcralkuwqocgsmcap.supabase.co}"
export SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-sbp_20a68b0be7088a01355c974d05cb334990e636b6}"
export SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a3djcmFsa3V3cW9jZ3NtY2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTI5NzQsImV4cCI6MjA3NTQ2ODk3NH0.td1b8gkB5V2vRiVITKlGDEg2l6iBbu4QrFNZTjfcMzo}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a3djcmFsa3V3cW9jZ3NtY2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5Mjk3NCwiZXhwIjoyMDc1NDY4OTc0fQ.mohLX11Wj3d4tujYh0aGnJlXp42fDMvxgFMZ3dDSCkI}"
export GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-Ov23li9BCMN97jO10riA}"
export GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-f5e09d78a532e219a3ed23bd6b99c088da68310e}"
export GITHUB_CALLBACK_URL="${GITHUB_CALLBACK_URL:-http://localhost:$PORT/connect/github/callback}"
export GITHUB_CLIENT_ID1="${GITHUB_CLIENT_ID:-Ov23lixY0hujOdXVfmuA}"
export GITHUB_CLIENT_SECRET1="${GITHUB_CLIENT_SECRET:-1221a3f72c538582b80225b89f00589f137779db}"
export FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
export VITE_SERVER_URL="${VITE_SERVER_URL:-http://localhost:8000}"
export SEPOLIA_RPC_URL="${SEPOLIA_RPC_URL:-https://eth-sepolia.g.alchemy.com/v2/qwTQJlI_ikPCGi1V5xolw}"
export PRIVATE_KEY="${PRIVATE_KEY:-4813ed4a8cd20a820f27022d8fadd80c91697430896b03b42edd4245e3954fc5}"
export KUDOS_TOKEN_CONTRACT_ADDRESS="${KUDOS_TOKEN_CONTRACT_ADDRESS:-0x8490a7b3800Cd46F3cB68E6e451FFbd8a7AdC6Ef}"

# Check if using placeholder values
if [[ "$SUPABASE_URL" == "https://example.supabase.co" ]]; then
    echo "⚠️  WARNING: Using placeholder Supabase URL!"
    echo "   This will cause DNS errors. Please set up real environment variables."
    echo "   See: documentation/ENVIRONMENT-SETUP.md"
    echo ""
else
    echo "✅ Using real Supabase credentials"
fi

echo "🌐 Server will start on port 54321 (Supabase default)"
echo "🔗 Health check: http://localhost:54321/functions/v1/connect/health"
echo "🔗 GitHub OAuth: http://localhost:54321/functions/v1/connect/github"
echo ""

# Start the server
echo "Starting server..."
deno run --allow-net --allow-env --allow-read --allow-write supabase/functions/connect/index.ts