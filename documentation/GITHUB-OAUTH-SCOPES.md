# 🔐 GitHub OAuth Scopes - Limit Access

## 🎯 **Current Scope**

Your server is currently requesting: `"user:email,repo"`

This gives access to:

- ✅ **user:email** - Read user's email address
- ⚠️ **repo** - Full access to all repositories (public and private)

## 🚀 **Recommended Minimal Scopes**

### **For Basic User Info Only:**

```typescript
githubAuthUrl.searchParams.set("scope", "user:email");
```

**Grants access to:**

- ✅ User's public profile
- ✅ User's email address
- ❌ No repository access

### **For Public Repository Access Only:**

```typescript
githubAuthUrl.searchParams.set("scope", "user:email,public_repo");
```

**Grants access to:**

- ✅ User's public profile
- ✅ User's email address
- ✅ Public repositories only
- ❌ No private repository access

### **For Specific Repository Access:**

```typescript
githubAuthUrl.searchParams.set("scope", "user:email,repo:status");
```

**Grants access to:**

- ✅ User's public profile
- ✅ User's email address
- ✅ Repository status (commits, pull requests)
- ❌ No code access

## 🔧 **How to Update Your Server**

### **Step 1: Edit the Server Code**

In `apps/dashboard/src/supabase/functions/server/index.tsx`, line 56:

```typescript
// Current (too broad):
githubAuthUrl.searchParams.set("scope", "user:email,repo");

// Recommended (minimal):
githubAuthUrl.searchParams.set("scope", "user:email");
```

### **Step 2: Restart Server**

```bash
yarn server:stop
yarn server
```

## 📋 **Available GitHub OAuth Scopes**

### **User Scopes:**

- `user` - Read user profile data
- `user:email` - Read user's email addresses
- `user:follow` - Follow/unfollow users

### **Repository Scopes:**

- `public_repo` - Access to public repositories
- `repo` - Full access to all repositories (public and private)
- `repo:status` - Access to repository status
- `repo_deployment` - Access to deployment status
- `repo:invite` - Access to repository invitations

### **Organization Scopes:**

- `read:org` - Read organization membership
- `write:org` - Write organization membership
- `admin:org` - Full organization access

### **Other Scopes:**

- `gist` - Create gists
- `notifications` - Access to notifications
- `delete_repo` - Delete repositories

## 🎯 **Recommended Scopes by Use Case**

### **For User Authentication Only:**

```typescript
"user:email";
```

**Perfect for**: Login, user identification, basic profile

### **For Public Repository Analysis:**

```typescript
"user:email,public_repo";
```

**Perfect for**: Analyzing public contributions, public repo stats

### **For Contribution Tracking:**

```typescript
"user:email,repo:status";
```

**Perfect for**: Tracking commits, pull requests, issues

### **For Full Repository Access:**

```typescript
"user:email,repo";
```

**Perfect for**: Repository management, code analysis

## ⚠️ **Security Best Practices**

### **1. Request Only What You Need**

- Start with minimal scopes
- Add more only if necessary
- Document why each scope is needed

### **2. User Consent**

- Users see exactly what permissions you're requesting
- More scopes = more user hesitation
- Fewer scopes = higher conversion rates

### **3. Scope Documentation**

```typescript
// Document why each scope is needed
const SCOPES = {
  USER_EMAIL: "user:email", // For user identification
  PUBLIC_REPO: "public_repo", // For public contribution analysis
  // Add more as needed with clear justification
};
```

## 🧪 **Testing Different Scopes**

### **Test with Minimal Scope:**

```typescript
githubAuthUrl.searchParams.set("scope", "user:email");
```

### **Test OAuth Flow:**

```bash
# Start server
yarn server

# Test OAuth
curl -I http://localhost:54321/functions/v1/connect/github
```

### **Check What Data You Get:**

After OAuth, check what user data is available in your callback handler.

## 🎉 **Benefits of Limited Scopes**

- ✅ **Better user trust** - Users see fewer permissions
- ✅ **Higher conversion** - More users will authorize
- ✅ **Security** - Principle of least privilege
- ✅ **Compliance** - Meets privacy requirements
- ✅ **Maintenance** - Easier to audit and manage

## 🚀 **Quick Implementation**

For most use cases, start with:

```typescript
githubAuthUrl.searchParams.set("scope", "user:email");
```

This gives you user identification without repository access - perfect for authentication! 🎯
