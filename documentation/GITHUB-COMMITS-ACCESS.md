# 📊 GitHub Commits Access - User Info & Commits

## 🎯 **Current Scope: Perfect for Your Needs**

Your server is configured with: `"user:email,repo"`

This gives you access to:

- ✅ **User information** - Profile, email, name
- ✅ **All repositories** - Public and private
- ✅ **Commits** - Full commit history and details
- ✅ **Pull requests** - PR data and reviews
- ✅ **Issues** - Issue tracking and comments

## 🚀 **What You Can Access**

### **User Information:**

```typescript
// After OAuth, you get access to:
const githubUser = {
  id: 12345,
  login: "username",
  name: "User Name",
  email: "user@example.com",
  avatar_url: "https://github.com/avatar.png",
  bio: "User bio",
  company: "Company Name",
  location: "Location",
  public_repos: 25,
  followers: 100,
  following: 50,
};
```

### **Repository Access:**

```typescript
// You can access:
- Repository list (public and private)
- Repository details
- Commit history
- Branch information
- Pull request data
- Issue data
```

### **Commit Information:**

```typescript
// For each commit, you can get:
const commit = {
  sha: "abc123def456",
  message: "Commit message",
  author: {
    name: "Author Name",
    email: "author@example.com",
    date: "2024-01-15T10:30:00Z",
  },
  committer: {
    name: "Committer Name",
    email: "committer@example.com",
    date: "2024-01-15T10:30:00Z",
  },
  tree: {
    sha: "tree_sha",
    url: "https://api.github.com/repos/owner/repo/git/trees/tree_sha",
  },
  stats: {
    additions: 10,
    deletions: 5,
    total: 15,
  },
  files: [
    {
      filename: "src/file.js",
      status: "modified",
      additions: 10,
      deletions: 5,
      changes: 15,
    },
  ],
};
```

## 🔧 **How to Use the Access**

### **1. Get User Information:**

```typescript
// In your OAuth callback handler
const userResponse = await fetch("https://api.github.com/user", {
  headers: {
    Authorization: `Bearer ${tokenData.access_token}`,
    Accept: "application/vnd.github.v3+json",
  },
});
const githubUser = await userResponse.json();
```

### **2. Get User's Repositories:**

```typescript
const reposResponse = await fetch("https://api.github.com/user/repos", {
  headers: {
    Authorization: `Bearer ${tokenData.access_token}`,
    Accept: "application/vnd.github.v3+json",
  },
});
const repositories = await reposResponse.json();
```

### **3. Get Commits from a Repository:**

```typescript
const commitsResponse = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/commits`,
  {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github.v3+json",
    },
  },
);
const commits = await commitsResponse.json();
```

### **4. Get User's Recent Activity:**

```typescript
const eventsResponse = await fetch(
  "https://api.github.com/users/{username}/events",
  {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github.v3+json",
    },
  },
);
const activity = await eventsResponse.json();
```

## 📊 **Perfect for Reward Systems**

### **What You Can Track:**

- ✅ **Commit frequency** - How often user commits
- ✅ **Repository contributions** - Which repos they work on
- ✅ **Code quality** - Lines added/deleted
- ✅ **Collaboration** - Pull requests and reviews
- ✅ **Issue resolution** - Issues closed and created

### **Example Reward Calculation:**

```typescript
// Calculate rewards based on activity
const calculateRewards = (commits, prs, issues) => {
  const commitPoints = commits.length * 10; // 10 points per commit
  const prPoints = prs.length * 50; // 50 points per PR
  const issuePoints = issues.length * 25; // 25 points per issue

  return commitPoints + prPoints + issuePoints;
};
```

## 🎯 **API Endpoints You Can Use**

### **User Data:**

- `GET /user` - Current user info
- `GET /user/repos` - User's repositories
- `GET /user/starred` - Starred repositories
- `GET /user/followers` - User's followers
- `GET /user/following` - Users being followed

### **Repository Data:**

- `GET /repos/{owner}/{repo}/commits` - Commit history
- `GET /repos/{owner}/{repo}/pulls` - Pull requests
- `GET /repos/{owner}/{repo}/issues` - Issues
- `GET /repos/{owner}/{repo}/stats/contributors` - Contributor stats

### **Activity Data:**

- `GET /users/{username}/events` - User activity
- `GET /users/{username}/events/public` - Public activity
- `GET /repos/{owner}/{repo}/commits/{sha}` - Specific commit

## 🔒 **Security & Privacy**

### **What Users See:**

When users authorize your app, they'll see:

- ✅ "Access your email address"
- ✅ "Access your repositories"
- ✅ "Read and write access to your repositories"

### **What You Can Do:**

- ✅ Read user profile and email
- ✅ List all repositories (public and private)
- ✅ Read commit history
- ✅ Read pull requests and issues
- ✅ Access repository statistics

### **What You Cannot Do:**

- ❌ Modify repositories
- ❌ Create repositories
- ❌ Delete repositories
- ❌ Change repository settings

## 🚀 **Implementation Example**

```typescript
// In your OAuth callback handler
const githubUser = await userResponse.json();
const repositories = await reposResponse.json();

// Get recent commits across all repositories
const recentCommits = [];
for (const repo of repositories) {
  const commits = await fetch(
    `https://api.github.com/repos/${repo.full_name}/commits`,
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  const repoCommits = await commits.json();
  recentCommits.push(...repoCommits.slice(0, 10)); // Last 10 commits per repo
}

// Calculate rewards
const totalCommits = recentCommits.length;
const rewardPoints = totalCommits * 10; // 10 points per commit
```

## 🎉 **Perfect for Your Use Case!**

Your current scope `"user:email,repo"` is ideal for:

- ✅ **User identification** - Get user profile and email
- ✅ **Commit tracking** - Access to all commit history
- ✅ **Contribution analysis** - Repository and activity data
- ✅ **Reward calculation** - All the data you need for points

This gives you everything needed for a comprehensive GitHub reward system! 🚀
