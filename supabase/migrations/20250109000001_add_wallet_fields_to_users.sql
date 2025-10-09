-- Add wallet-related fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_private_key TEXT,
ADD COLUMN IF NOT EXISTS wallet_mnemonic_phrase TEXT;

-- Add indexes for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);

-- Add comments for documentation
COMMENT ON COLUMN public.users.wallet_address IS 'User wallet address for cryptocurrency transactions';
COMMENT ON COLUMN public.users.wallet_private_key IS 'Encrypted private key for wallet operations';
COMMENT ON COLUMN public.users.wallet_mnemonic_phrase IS 'Encrypted mnemonic phrase for wallet recovery';
