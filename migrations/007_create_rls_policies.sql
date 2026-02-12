-- Migration: Create Row Level Security policies
-- Description: Implement RLS for multi-tenant data isolation
-- Date: 2026-02-13

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
-- expenses already has RLS enabled from initial schema

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create new organizations
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Owners and admins can update organization
CREATE POLICY "Owners and admins can update organization" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Only owners can delete organization
CREATE POLICY "Only owners can delete organization" ON organizations
  FOR DELETE
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- ============================================
-- ORGANIZATION_MEMBERS POLICIES
-- ============================================

-- Users can view members of their organizations
CREATE POLICY "Users can view organization members" ON organization_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Owners and admins can add members
CREATE POLICY "Owners and admins can add members" ON organization_members
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Owners and admins can update member roles
CREATE POLICY "Owners and admins can update members" ON organization_members
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Owners and admins can remove members
CREATE POLICY "Owners and admins can remove members" ON organization_members
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- EXPENSES POLICIES (Update existing)
-- ============================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow all operations on expenses" ON expenses;

-- Users can view expenses from their organizations
CREATE POLICY "Users can view organization expenses" ON expenses
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Members and above can create expenses
CREATE POLICY "Members can create expenses" ON expenses
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'accountant', 'member')
    )
    AND created_by = auth.uid()
  );

-- Users can update their own expenses, or accountants/admins/owners can update any
CREATE POLICY "Users can update expenses" ON expenses
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND (
        role IN ('owner', 'admin', 'accountant')
        OR (role = 'member' AND expenses.created_by = auth.uid())
      )
    )
  );

-- Owners, admins, and accountants can delete expenses
CREATE POLICY "Authorized users can delete expenses" ON expenses
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'accountant')
    )
  );

-- ============================================
-- CATEGORIES POLICIES (Update existing)
-- ============================================

-- Drop old policy if exists
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

-- Everyone can view categories (they are shared across all organizations)
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT
  USING (true);

-- Only system admins can modify categories (optional - adjust as needed)
-- For now, we'll allow authenticated users to suggest, but you may want to restrict this
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT
  USING (true);
