# 📁 Scripts Directory

This directory contains all the shell scripts for managing the GitHub Reward Coin project.

## 🚀 **Available Scripts**

### **Server Management**

- `start-server.sh` - Start the Supabase function server with auto port handling
- `stop-server.sh` - Stop all running server processes
- `run-server.sh` - Easy server runner from project root

### **Testing & Debugging**

- `debug-oauth.sh` - Debug GitHub OAuth setup and environment variables
- `test-endpoints.sh` - Test server endpoints and health checks
- `test-server.sh` - Test server with example environment variables

## 🎯 **Usage from Project Root**

### **Easy Commands (Recommended)**

```bash
# Start server
yarn server

# Stop server
yarn server:stop

# Debug OAuth issues
yarn server:debug

# Test endpoints
yarn server:test
```

### **Direct Script Execution**

```bash
# Start server
./scripts/start-server.sh

# Stop server
./scripts/stop-server.sh

# Debug OAuth
./scripts/debug-oauth.sh

# Test endpoints
./scripts/test-endpoints.sh
```

### **Using Deno Tasks**

```bash
# Start server
deno task start-server

# Stop server
deno task stop-server
```

## 🔧 **Script Details**

### **start-server.sh**

- Automatically handles port conflicts
- Finds available ports if default is busy
- Sets up environment variables
- Starts Deno server with proper permissions

### **stop-server.sh**

- Kills processes on ports 8000, 8001, 8002, 8003
- Cleans up hanging server processes
- Safe to run multiple times

### **debug-oauth.sh**

- Checks if server is running
- Validates environment variables
- Tests OAuth endpoints
- Provides troubleshooting tips

### **test-endpoints.sh**

- Tests health endpoint
- Tests GitHub OAuth endpoint
- Verifies server responsiveness

### **test-server.sh**

- Runs server with example environment variables
- Good for testing server functionality
- Uses placeholder credentials

## 🎉 **Quick Start**

1. **Start the server**:

   ```bash
   yarn server
   ```

2. **Debug if needed**:

   ```bash
   yarn server:debug
   ```

3. **Test endpoints**:

   ```bash
   yarn server:test
   ```

4. **Stop when done**:
   ```bash
   yarn server:stop
   ```

All scripts are designed to work from the project root directory! 🚀

## 📚 **Related Documentation**

- **[Documentation Index](../documentation/README.md)** - Complete documentation guide
- **[Server Testing Guide](../documentation/README-SERVER-TESTING.md)** - Detailed server setup
- **[OAuth Setup Guide](../documentation/OAUTH-SETUP-GUIDE.md)** - GitHub OAuth configuration
- **[Port Conflict Solution](../documentation/PORT-CONFLICT-SOLUTION.md)** - Troubleshooting port issues
