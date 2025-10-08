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
kill_port $PORT

# Check if port is still in use, if so find another
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Port $PORT is still in use, finding alternative..."
    PORT=$(find_available_port $PORT)
    echo "📍 Using port $PORT instead"
fi

export SUPABASE_URL="${SUPABASE_URL:-https://uvkwcralkuwqocgsmcap.supabase.co}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a3djcmFsa3V3cW9jZ3NtY2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTI5NzQsImV4cCI6MjA3NTQ2ODk3NH0.td1b8gkB5V2vRiVITKlGDEg2l6iBbu4QrFNZTjfcMzo}"
export GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-Ov23liBnvStPdHDqXkec}"
export GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-5ada8cc4890cab652dd36e42c46ee11a84b0f560}"
export FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
export VITE_SERVER_URL="${VITE_SERVER_URL:-http://localhost:8000}"

# Check if using placeholder values
if [[ "$SUPABASE_URL" == "https://example.supabase.co" ]]; then
    echo "⚠️  WARNING: Using placeholder Supabase URL!"
    echo "   This will cause DNS errors. Please set up real environment variables."
    echo "   See: documentation/ENVIRONMENT-SETUP.md"
    echo ""
else
    echo "✅ Using real Supabase credentials"
fi

echo "🌐 Server will start on port $PORT"
echo "🔗 Health check: http://localhost:$PORT/make-server-b1e42adc/health"
echo "🔗 GitHub OAuth: http://localhost:$PORT/connect/github"
echo ""

# Start the server
echo "Starting server..."
deno run --allow-net --allow-env --allow-read --allow-write apps/dashboard/src/supabase/functions/server/index.tsx
