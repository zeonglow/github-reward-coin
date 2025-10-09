-- Create users table for GitHub OAuth integration
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT NOT NULL PRIMARY KEY,
  github_token TEXT,
  github_username TEXT,
  github_id BIGINT,
  email TEXT,
  wallet_address TEXT,
  accumulated_reward DECIMAL(18,8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_github_id ON public.users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_github_username ON public.users(github_username);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on users" ON public.users
  FOR ALL USING (true);
