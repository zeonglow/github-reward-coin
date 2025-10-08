#!/bin/bash

# Script to stop the Supabase function server
echo "🛑 Stopping Supabase Function Server"
echo "==================================="

# Kill processes on common ports
for port in 8000 8001 8002 8003; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔄 Killing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
done

echo "✅ All server processes stopped"
