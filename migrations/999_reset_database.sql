-- ============================================
-- RESET DATABASE - DROP EVERYTHING
-- ============================================
-- WARNING: This will DELETE ALL DATA and DROP ALL TABLES!
-- Use this to start fresh from scratch
-- ============================================

-- ============================================
-- 1. DROP ALL POLICIES (RLS)
-- ============================================

-- Drop expenses policies
DROP POLICY IF EXISTS "Users can view organization expenses" ON expenses;
DROP POLICY IF EXISTS "Members can create expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Authorized users can delete expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all operations on expenses" ON expenses;

-- Drop categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

-- Drop users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Drop organizations policies
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Owners and admins can update organization" ON organizations;
DROP POLICY IF EXISTS "Only owners can delete organization" ON organizations;

-- Drop organization_members policies
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON organization_members;

-- Drop storage policies
DROP POLICY IF EXISTS "Public Access for expense images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload expense images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update expense images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete expense images" ON storage.objects;

-- ============================================
-- 2. DROP ALL TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS ensure_owner_exists ON organization_members;

-- ============================================
-- 3. DROP ALL TABLES (CASCADE)
-- ============================================

-- Drop in reverse order of dependencies
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ============================================
-- 4. DROP ALL FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS ensure_organization_has_owner() CASCADE;

-- ============================================
-- 5. DROP STORAGE BUCKET
-- ============================================

DELETE FROM storage.buckets WHERE id = 'expense-images';

-- ============================================
-- RESET COMPLETE
-- ============================================
-- All tables, policies, triggers, functions, and storage buckets have been removed
-- Database is now clean and ready for fresh schema
--
-- Next step: Run 000_complete_schema.sql to create everything from scratch
-- ============================================
