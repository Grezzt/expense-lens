-- Migration: Fix Users RLS Policy
-- Description: Allow authenticated users to view all public profiles (needed for member lists)
-- Date: 2026-02-18

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create a new permissive policy for SELECT
-- This allows any logged-in user to read basic profile info (name, avatar) of other users.
-- This is standard for social/collaboration apps.
CREATE POLICY "Authenticated users can view all profiles" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Ensure the UPDATE policy remains restrictive (only own profile)
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (id = auth.uid());

-- Refresh Schema Cache
NOTIFY pgrst, 'reload config';
