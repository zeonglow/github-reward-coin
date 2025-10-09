#!/bin/bash

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "📁 Loading environment variables from .env file..."
    # Load .env file and export variables
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
elif [ -f "config.env" ]; then
    echo "📁 Loading environment variables from config.env file..."
    set -a
    source config.env
    set +a
elif [ -f "supabase/.env" ]; then
    echo "📁 Loading environment variables from supabase/.env file..."
    set -a
    source supabase/.env
    set +a
else
    echo "⚠️  No .env file found. Using default values..."
    # Set default environment variables
    export GITHUB_CLIENT_ID="your_github_client_id_here"
    export GITHUB_CLIENT_SECRET="your_github_client_secret_here"
    export FRONTEND_URL="http://localhost:3000"
fi

echo "🚀 Starting Supabase Functions with environment variables..."
echo "GITHUB_CLIENT_ID: $GITHUB_CLIENT_ID"
echo "GITHUB_CLIENT_SECRET: $GITHUB_CLIENT_SECRET"
echo "GITHUB_CALLBACK_URL: $GITHUB_CALLBACK_URL"
echo "FRONTEND_URL: $FRONTEND_URL"
echo ""

# Start Supabase functions with environment file
supabase functions serve --no-verify-jwt --env-file .env
