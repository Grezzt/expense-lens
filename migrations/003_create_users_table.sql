-- Migration: Create users table
-- Description: Create users table for user profiles and authentication
-- Date: 2026-02-13

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user profiles and authentication information';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.full_name IS 'User full name for display';
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';

-- Note: If using Supabase Auth, you can link this to auth.users
-- Example: Add foreign key to auth.users if needed
-- ALTER TABLE users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
