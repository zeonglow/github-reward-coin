#!/bin/bash

# Script to stop the Supabase function server
echo "🛑 Stopping Supabase Function Server"
echo "==================================="

# Kill processes on common ports
for port in 54321 54322 54323 54324; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔄 Killing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
done

echo "✅ All server processes stopped"
