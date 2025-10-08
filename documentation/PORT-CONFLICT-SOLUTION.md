# 🚀 Port Conflict Solution - Supabase Function Server

## ✅ **Problem Solved!**

The "Address already in use" error has been resolved with automatic port handling.

## 🛠️ **Easy Commands to Use**

### **Start Server (Auto-handles port conflicts)**

```bash
# From project root
yarn server
# or
./scripts/start-server.sh
```

### **Stop All Servers**

```bash
# From project root
yarn server:stop
# or
./scripts/stop-server.sh
```

### **Start with Custom Port**

```bash
./scripts/start-server.sh 8001  # Use port 8001
```

## 🎯 **What the Scripts Do**

### `start-server.sh`:

- ✅ Kills any existing process on the target port
- ✅ If port is still busy, automatically finds next available port
- ✅ Sets up environment variables
- ✅ Starts the server with proper permissions

### `stop-server.sh`:

- ✅ Kills processes on ports 8000, 8001, 8002, 8003
- ✅ Cleans up any hanging server processes

## 🚀 **Quick Start Guide**

1. **Stop any existing servers**:

   ```bash
   yarn server:stop
   ```

2. **Start the server**:

   ```bash
   yarn server
   ```

3. **Test the server**:
   ```bash
   curl http://localhost:8000/make-server-b1e42adc/health
   ```

## 🔧 **Environment Variables**

Create a `.env.local` file with your actual values:

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

## 🎉 **You're Ready!**

- ✅ **Port conflicts handled automatically**
- ✅ **Server starts on available port**
- ✅ **Easy start/stop commands**
- ✅ **Environment variable support**

Just run `./start-server.sh` and your server will start without port conflicts! 🚀
