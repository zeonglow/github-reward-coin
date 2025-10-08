# 🗄️ Database Setup Guide

## ❌ **Current Issue: Missing Table**

The error you're seeing:
```
Could not find the table 'public.kv_store_b1e42adc' in the schema cache
```

This happens because the server is trying to use a specific table that doesn't exist in your Supabase database.

## 🚀 **Quick Fix Options**

### **Option 1: Create the Required Table (Recommended)**

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the kv_store table
CREATE TABLE kv_store_b1e42adc (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Grant necessary permissions
GRANT ALL ON kv_store_b1e42adc TO anon;
GRANT ALL ON kv_store_b1e42adc TO authenticated;
GRANT ALL ON kv_store_b1e42adc TO service_role;
```

### **Option 2: Use In-Memory Storage (Temporary)**

If you don't want to create the table, we can modify the server to use in-memory storage instead of Supabase for OAuth state management.

## 🎯 **Step-by-Step Fix**

### **1. Go to Supabase Dashboard**
1. Open: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**

### **2. Create the Table**
Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS kv_store_b1e42adc (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Grant permissions
GRANT ALL ON kv_store_b1e42adc TO anon;
GRANT ALL ON kv_store_b1e42adc TO authenticated;
GRANT ALL ON kv_store_b1e42adc TO service_role;
```

### **3. Run the SQL**
Click **Run** to execute the SQL and create the table.

### **4. Restart Server**
```bash
yarn server
```

## 🧪 **Test the Fix**

```bash
# Test OAuth endpoint
curl -I http://localhost:8000/connect/github

# Should redirect to GitHub (no table errors)
```

## ⚠️ **Alternative: In-Memory Storage**

If you prefer not to create the table, I can modify the server to use in-memory storage for OAuth state management instead of Supabase. This would eliminate the database dependency for OAuth flow.

## 🎯 **Quick Checklist**

- [ ] Created `kv_store_b1e42adc` table in Supabase
- [ ] Granted proper permissions to the table
- [ ] Restarted server
- [ ] OAuth endpoint redirects to GitHub (no table errors)

## 🚀 **Ready to Test!**

Once the table is created, your OAuth flow will work perfectly! 🎉
