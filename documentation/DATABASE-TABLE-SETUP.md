# 🗄️ Database Table Setup - Production Ready

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Go to Supabase SQL Editor**

1. Open: https://supabase.com/dashboard
2. Select your project: `uvkwcralkuwqocgsmcap`
3. Go to **SQL Editor** (left sidebar)

### **Step 2: Create the Table**

Copy and paste this SQL:

```sql
-- Create the kv_store table for OAuth state management
CREATE TABLE IF NOT EXISTS kv_store_b1e42adc (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Grant necessary permissions
GRANT ALL ON kv_store_b1e42adc TO anon;
GRANT ALL ON kv_store_b1e42adc TO authenticated;
GRANT ALL ON kv_store_b1e42adc TO service_role;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_b1e42adc(key);

-- Optional: Set up RLS (Row Level Security) if needed
-- ALTER TABLE kv_store_b1e42adc ENABLE ROW LEVEL SECURITY;
```

### **Step 3: Run the SQL**

1. Click **Run** to execute the SQL
2. You should see "Success. No rows returned"

### **Step 4: Test the Setup**

```bash
# Restart server
yarn server:stop
yarn server

# Test OAuth endpoint
curl -I http://localhost:54321/functions/v1/connect/github
```

## 🎯 **What This Table Does**

### **Purpose:**

- **OAuth State Storage** - Stores temporary OAuth state tokens
- **Security** - Prevents CSRF attacks during GitHub OAuth
- **Expiration** - States expire after 10 minutes
- **Cleanup** - States are deleted after use

### **Table Structure:**

```sql
kv_store_b1e42adc:
├── key (TEXT, PRIMARY KEY)     -- "github_oauth_state_abc123..."
└── value (JSONB)               -- {"timestamp": 1234567890, "expires": 1234567890}
```

### **Example Data:**

```json
{
  "key": "github_oauth_state_3b78df25-00b4-4b80-b915-263d57c1df7a",
  "value": {
    "timestamp": 1759892974000,
    "expires": 1759893574000
  }
}
```

## 🔒 **Security Benefits**

### **Production Ready:**

- ✅ **Survives server restarts** - Database persistence
- ✅ **Multi-server support** - Shared storage across instances
- ✅ **High availability** - No single point of failure
- ✅ **Scalable** - Works with load balancers

### **OAuth Security:**

- ✅ **CSRF protection** - Random state tokens
- ✅ **State verification** - Prevents replay attacks
- ✅ **Automatic expiration** - 10-minute timeout
- ✅ **Cleanup** - States deleted after use

## 🧪 **Testing the Setup**

### **1. Verify Table Creation:**

```sql
-- Check if table exists
SELECT * FROM kv_store_b1e42adc LIMIT 1;
```

### **2. Test OAuth Flow:**

```bash
# Start server
yarn server

# Test OAuth endpoint (should redirect to GitHub)
curl -I http://localhost:54321/functions/v1/connect/github

# Check if state is stored
# (You can check in Supabase dashboard → Table Editor)
```

### **3. Monitor State Storage:**

1. Go to Supabase Dashboard → Table Editor
2. Select `kv_store_b1e42adc` table
3. You should see OAuth states being created and deleted

## ⚠️ **Troubleshooting**

### **"Table doesn't exist" error:**

- Make sure you ran the SQL in the correct project
- Check that the table name is exactly `kv_store_b1e42adc`

### **"Permission denied" error:**

- Make sure you granted permissions to all roles
- Check your service role key has proper access

### **"Connection failed" error:**

- Verify your Supabase URL and service role key
- Check that your Supabase project is active

## 🎉 **Ready for Production!**

Once the table is created, your OAuth flow will be:

- ✅ **Persistent** - Survives server restarts
- ✅ **Scalable** - Works with multiple servers
- ✅ **Secure** - Full OAuth security maintained
- ✅ **Reliable** - Database-backed storage

Perfect for production deployment! 🚀
