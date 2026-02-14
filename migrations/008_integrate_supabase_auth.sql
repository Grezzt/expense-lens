-- Migration: Integrate Supabase Auth with Users Table
-- Description: Create trigger to automatically sync auth.users with public.users table
-- Date: 2026-02-13
-- This migration adds integration between Supabase Auth and our custom users table

-- ============================================
-- FUNCTION: Handle New User Registration
-- ============================================
-- This function automatically creates a user record in public.users
-- when a new user signs up via Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: On Auth User Created
-- ============================================
-- Trigger that fires when a new user is created in auth.users

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Handle User Updates
-- ============================================
-- Sync updates from auth.users to public.users

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: On Auth User Updated
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data
  )
  EXECUTE FUNCTION public.handle_user_update();

-- ============================================
-- FUNCTION: Handle User Deletion
-- ============================================
-- Clean up user data when auth user is deleted

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: On Auth User Deleted
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
-- Modify users table to use auth.users UUID as primary key
-- This ensures consistency between auth.users and public.users

-- Update the id column to reference auth.users
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Add foreign key constraint to auth.users (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_id_fkey'
    AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_fkey
      FOREIGN KEY (id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Re-add primary key
ALTER TABLE public.users
  ADD PRIMARY KEY (id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user record in public.users when a new user signs up via Supabase Auth';
COMMENT ON FUNCTION public.handle_user_update() IS 'Syncs user profile updates from auth.users to public.users';
COMMENT ON FUNCTION public.handle_user_delete() IS 'Removes user record from public.users when auth user is deleted';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Supabase Auth is now integrated with public.users table
-- New user signups will automatically create records in public.users
-- Updates and deletions are also synced automatically
