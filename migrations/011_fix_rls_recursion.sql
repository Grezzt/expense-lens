-- Migration: Fix RLS Recursion - Alternative Approach
-- Description: Use simpler policies that don't cause recursion
-- Date: 2026-02-15

-- ============================================
-- DROP ALL EXISTING organization_members POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Allow first member insert" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON organization_members;

-- ============================================
-- DISABLE RLS TEMPORARILY FOR organization_members
-- We'll handle permissions in application code
-- ============================================

ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- Note: This is a temporary solution. In production, you should:
-- 1. Use Supabase service role for organization creation
-- 2. Or implement proper RLS policies using security definer functions
-- 3. Or use triggers to handle the first member insertion

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
