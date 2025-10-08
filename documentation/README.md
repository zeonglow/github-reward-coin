# 📚 Documentation

This directory contains all documentation for the GitHub Reward Coin project.

## 🚀 **Quick Start Guides**

### **[Server Testing Guide](README-SERVER-TESTING.md)**

Complete guide for testing Supabase functions locally with multiple methods:

- Direct Deno server execution
- Using Supabase CLI
- Using test scripts
- Environment setup and troubleshooting

### **[OAuth Setup Guide](OAUTH-SETUP-GUIDE.md)**

Step-by-step guide for setting up GitHub OAuth:

- Creating GitHub OAuth app
- Getting Supabase credentials
- Environment variable configuration
- Common issues and solutions

### **[GitHub OAuth Callback Fix](GITHUB-OAUTH-CALLBACK-FIX.md)**

Fix "redirect_uri is not associated" errors:

- Update GitHub OAuth app callback URL
- Local development vs production setup
- Supabase Edge Functions alternative
- Testing and troubleshooting

### **[GitHub OAuth Scopes](GITHUB-OAUTH-SCOPES.md)**

Limit GitHub OAuth permissions to only what you need:

- Minimal scopes for better security
- Available GitHub OAuth scopes
- Recommended scopes by use case
- Security best practices

### **[GitHub Commits Access](GITHUB-COMMITS-ACCESS.md)**

Access user information and commits for reward systems:

- Current scope capabilities
- API endpoints for user data and commits
- Reward calculation examples
- Implementation guide

### **[GitHub Organization Access](GITHUB-ORGANIZATION-ACCESS.md)**

Understand why you're being asked for organization access:

- Why organization access is requested
- What permissions you're granting
- Security and privacy implications
- Why it's necessary for reward systems

### **[Users Table Setup](USERS-TABLE-SETUP.md)**

Fix "Could not find the table 'public.users'" error:

- Create users table in Supabase
- SQL commands for table creation
- Alternative approaches
- Testing and troubleshooting

### **[Environment Setup Guide](ENVIRONMENT-SETUP.md)**

Fix DNS errors and environment variable issues:

- Setting up real Supabase credentials
- GitHub OAuth app configuration
- Troubleshooting DNS errors
- Environment variable validation

### **[Database Setup Guide](DATABASE-SETUP.md)**

Fix missing table errors and database issues:

- Creating required Supabase tables
- Using in-memory storage as alternative
- Database permissions setup
- Troubleshooting table errors

### **[Database Table Setup](DATABASE-TABLE-SETUP.md)**

Production-ready database setup for OAuth state management:

- Step-by-step table creation
- SQL commands and permissions
- Production benefits (restart survival, multi-server)
- Testing and troubleshooting

## 🔧 **Technical Documentation**

### **[Port Conflict Solution](PORT-CONFLICT-SOLUTION.md)**

Solutions for "Address already in use" errors:

- Automatic port handling
- Script usage and commands
- Troubleshooting port conflicts

### **[Supabase Configuration](supabase-config.md)**

Detailed Supabase setup and testing:

- Local development setup
- Environment configuration
- Testing endpoints
- Debugging OAuth flow

## 🎯 **Getting Started**

1. **Read the [Server Testing Guide](README-SERVER-TESTING.md)** for basic setup
2. **Follow the [OAuth Setup Guide](OAUTH-SETUP-GUIDE.md)** for GitHub integration
3. **Use [Port Conflict Solution](PORT-CONFLICT-SOLUTION.md)** if you encounter port issues
4. **Reference [Supabase Configuration](supabase-config.md)** for advanced setup

## ⚠️ **Troubleshooting**

If you get "No such file or directory" errors with scripts:

- Make sure you're running commands from the project root
- Use `yarn server` instead of direct script execution
- Check that all scripts are in the `/scripts` directory

## 🛠️ **Scripts Documentation**

For information about available scripts, see:

- `/scripts/README.md` - Complete scripts documentation
- `yarn server` - Start server
- `yarn server:debug` - Debug OAuth issues
- `yarn server:test` - Test endpoints

## 🎉 **Quick Commands**

```bash
# Start everything
yarn server

# Debug OAuth issues
yarn server:debug

# Test endpoints
yarn server:test

# Stop everything
yarn server:stop
```

All documentation is organized for easy navigation and quick reference! 🚀
