# 👥 Users Table Setup - Fix Database Error

## ❌ **Current Error**

```
Database error: Could not find the table 'public.users' in the schema cache
```

This happens because your server is trying to save GitHub user data to a `users` table that doesn't exist in your Supabase database.

## 🚀 **Quick Fix: Create Users Table**

### **Step 1: Go to Supabase SQL Editor**

1. Open: https://supabase.com/dashboard
2. Select your project: `uvkwcralkuwqocgsmcap`
3. Go to **SQL Editor** (left sidebar)

### **Step 2: Create the Users Table**

Copy and paste this SQL:

```sql
-- Create the users table for storing GitHub user data
CREATE TABLE IF NOT EXISTS users (
  id TEXT NOT NULL PRIMARY KEY,
  github_token TEXT,
  github_username TEXT,
  github_id BIGINT,
  email TEXT,
  wallet_address TEXT, -- Crypto wallet address format
  accumulated_reward DECIMAL(18,8) DEFAULT 0, -- Accumulated amount of crypto this user accumulated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant necessary permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_github_username ON users(github_username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_accumulated_reward ON users(accumulated_reward);

-- Optional: Set up RLS (Row Level Security) if needed
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### **Step 3: Run the SQL**

1. Click **Run** to execute the SQL
2. You should see "Success. No rows returned"

### **Step 4: Test the Fix**

```bash
# Restart server
yarn server:stop
yarn server

# Test OAuth flow
curl -I http://localhost:8000/connect/github
```

## 🎯 **What This Table Stores**

### **Crypto Reward Fields:**

- ✅ **wallet_address** - User's crypto wallet address (e.g., Ethereum, Bitcoin)
- ✅ **accumulated_reward** - Total crypto rewards earned by the user
- ✅ **DECIMAL(18,8)** - High precision for crypto amounts (18 digits, 8 decimal places)

### **Table Structure:**

```sql
users:
├── id (TEXT, PRIMARY KEY)           -- User ID (placeholder-user-id)
├── github_token (TEXT)               -- GitHub OAuth token
├── github_username (TEXT)            -- GitHub username
├── github_id (BIGINT)                -- GitHub user ID
├── email (TEXT)                      -- User's email
├── wallet_address (TEXT)            -- Crypto wallet address format
├── accumulated_reward (DECIMAL)     -- Accumulated amount of crypto
├── created_at (TIMESTAMP)            -- When user was created
└── updated_at (TIMESTAMP)            -- When user was last updated
```

### **Example Data:**

```json
{
  "id": "placeholder-user-id",
  "github_token": "gho_abc123def456...",
  "github_username": "josualeonard",
  "github_id": 12345,
  "email": "josua@example.com",
  "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "accumulated_reward": 150.75,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## 🔧 **Alternative: Skip Database Storage**

If you don't want to create the users table, you can modify the server to skip database storage:

### **Option 1: Comment Out Database Save**

In `apps/dashboard/src/supabase/functions/server/index.tsx`, comment out lines 131-142:

```typescript
// Save to Supabase
// const { error: dbError } = await supabase.from("users").upsert({
//   id: userId,
//   github_token: tokenData.access_token,
//   github_username: githubUser.login,
//   github_id: githubUser.id,
//   email: githubUser.email,
//   updated_at: new Date().toISOString(),
// });

// if (dbError) {
//   throw new Error(`Database error: ${dbError.message}`);
// }
```

### **Option 2: Use Memory Storage**

Store user data in memory instead of database (not persistent across restarts).

## 🎯 **Recommended Approach**

### **For Development:**

- ✅ **Create the users table** - Full functionality
- ✅ **Store user data** - Persistent across restarts
- ✅ **Track user sessions** - Better user experience

### **For Testing:**

- ✅ **Skip database storage** - Quick testing
- ✅ **Comment out database code** - No table needed
- ✅ **Focus on OAuth flow** - Test authentication

## 🧪 **Testing the Fix**

### **1. Verify Table Creation:**

```sql
-- Check if table exists
SELECT * FROM users LIMIT 1;
```

### **2. Test OAuth Flow:**

```bash
# Start server
yarn server

# Test OAuth endpoint
curl -I http://localhost:8000/connect/github

# Complete OAuth flow
# Check if user data is saved in Supabase dashboard
```

### **3. Check User Data:**

1. Go to Supabase Dashboard → Table Editor
2. Select `users` table
3. You should see user data after OAuth completion

## ⚠️ **Troubleshooting**

### **"Table doesn't exist" error:**

- Make sure you ran the SQL in the correct project
- Check that the table name is exactly `users`

### **"Permission denied" error:**

- Make sure you granted permissions to all roles
- Check that your service role key has proper access

### **"Connection failed" error:**

- Verify your Supabase URL and service role key
- Check that your Supabase project is active

## 🎉 **Ready for OAuth!**

Once the `users` table is created, your GitHub OAuth flow will work completely:

- ✅ **User authentication** - GitHub OAuth works
- ✅ **User data storage** - User info saved to database
- ✅ **Token management** - GitHub tokens stored securely
- ✅ **User tracking** - Track user sessions and activity
- ✅ **Crypto wallet support** - Store user wallet addresses
- ✅ **Reward tracking** - Track accumulated crypto rewards

### **Crypto Reward System Features:**

- ✅ **Wallet integration** - Store user crypto wallet addresses
- ✅ **Reward accumulation** - Track total crypto earned
- ✅ **High precision** - DECIMAL(18,8) for accurate crypto amounts
- ✅ **Performance optimized** - Indexed for fast queries

Perfect for a complete GitHub reward system with crypto payouts! 🚀
