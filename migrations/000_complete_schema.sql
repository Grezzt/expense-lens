-- ============================================
-- ExpenseLens Complete Database Schema
-- ============================================
-- This is a consolidated migration that can be run on:
-- 1. Fresh database (all tables will be created)
-- 2. Existing database with supabase-schema.sql (will update safely)
--
-- Run this INSTEAD of individual migration files if you already ran supabase-schema.sql
-- ============================================

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Create function to automatically update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Stores user profiles and authentication information';

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE organizations IS 'Stores company/organization information for multi-tenancy';

-- ============================================
-- ORGANIZATION MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'accountant', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);

-- Function to ensure at least one owner per organization
CREATE OR REPLACE FUNCTION ensure_organization_has_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.role != 'owner')) THEN
    IF NOT EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = OLD.organization_id
      AND role = 'owner'
      AND id != OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot remove the last owner from organization';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_owner_exists ON organization_members;
CREATE TRIGGER ensure_owner_exists
  BEFORE UPDATE OR DELETE ON organization_members
  FOR EACH ROW
  WHEN (OLD.role = 'owner')
  EXECUTE FUNCTION ensure_organization_has_owner();

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  keywords TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE categories IS 'Stores expense categories and their associated keywords for auto-categorization';

-- ============================================
-- EXPENSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  raw_data JSONB,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'VERIFIED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if table already exists (for migration from old schema)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='expenses' AND column_name='organization_id') THEN
    ALTER TABLE expenses ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='expenses' AND column_name='created_by') THEN
    ALTER TABLE expenses ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_expenses_organization_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE expenses IS 'Stores expense records with organization and user tracking';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Allow all operations on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

-- USERS POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- ORGANIZATIONS POLICIES
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT
  USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Owners and admins can update organization" ON organizations;
CREATE POLICY "Owners and admins can update organization" ON organizations
  FOR UPDATE
  USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

DROP POLICY IF EXISTS "Only owners can delete organization" ON organizations;
CREATE POLICY "Only owners can delete organization" ON organizations
  FOR DELETE
  USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role = 'owner'));

-- ORGANIZATION_MEMBERS POLICIES
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
CREATE POLICY "Users can view organization members" ON organization_members
  FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners and admins can add members" ON organization_members;
CREATE POLICY "Owners and admins can add members" ON organization_members
  FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

DROP POLICY IF EXISTS "Owners and admins can update members" ON organization_members;
CREATE POLICY "Owners and admins can update members" ON organization_members
  FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

DROP POLICY IF EXISTS "Owners and admins can remove members" ON organization_members;
CREATE POLICY "Owners and admins can remove members" ON organization_members
  FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- EXPENSES POLICIES
DROP POLICY IF EXISTS "Users can view organization expenses" ON expenses;
CREATE POLICY "Users can view organization expenses" ON expenses
  FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Members can create expenses" ON expenses;
CREATE POLICY "Members can create expenses" ON expenses
  FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'accountant', 'member'))
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
CREATE POLICY "Users can update expenses" ON expenses
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND (role IN ('owner', 'admin', 'accountant') OR (role = 'member' AND expenses.created_by = auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Authorized users can delete expenses" ON expenses;
CREATE POLICY "Authorized users can delete expenses" ON expenses
  FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'accountant')));

-- CATEGORIES POLICIES
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-images', 'expense-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access for expense images" ON storage.objects;
CREATE POLICY "Public Access for expense images"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-images');

DROP POLICY IF EXISTS "Authenticated users can upload expense images" ON storage.objects;
CREATE POLICY "Authenticated users can upload expense images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-images');

DROP POLICY IF EXISTS "Authenticated users can update expense images" ON storage.objects;
CREATE POLICY "Authenticated users can update expense images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'expense-images');

DROP POLICY IF EXISTS "Authenticated users can delete expense images" ON storage.objects;
CREATE POLICY "Authenticated users can delete expense images"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-images');

-- ============================================
-- SEED DATA
-- ============================================

-- Seed business expense categories
INSERT INTO categories (name, keywords) VALUES
  ('Biaya Operasional', ARRAY['operasional', 'operational', 'utilities', 'listrik', 'pln', 'air', 'pdam', 'internet', 'wifi', 'telepon', 'phone', 'sewa', 'rent', 'maintenance', 'perawatan']),
  ('Gaji & Tunjangan', ARRAY['gaji', 'salary', 'payroll', 'tunjangan', 'allowance', 'bonus', 'insentif', 'incentive', 'lembur', 'overtime', 'bpjs', 'jamsostek']),
  ('Perlengkapan Kantor', ARRAY['atk', 'stationery', 'office', 'kantor', 'printer', 'kertas', 'paper', 'tinta', 'ink', 'supplies', 'perlengkapan', 'furniture', 'meja', 'kursi']),
  ('Transportasi & Perjalanan Dinas', ARRAY['transportasi', 'transport', 'grab', 'gojek', 'uber', 'taxi', 'bensin', 'fuel', 'bbm', 'parkir', 'parking', 'tol', 'toll', 'tiket', 'ticket', 'hotel', 'penginapan', 'perjalanan', 'travel', 'dinas']),
  ('Pemasaran & Iklan', ARRAY['marketing', 'pemasaran', 'iklan', 'advertising', 'promosi', 'promotion', 'branding', 'sosmed', 'social media', 'google ads', 'facebook ads', 'instagram', 'billboard', 'brosur', 'flyer']),
  ('Jasa Profesional', ARRAY['konsultan', 'consultant', 'lawyer', 'pengacara', 'akuntan', 'accountant', 'notaris', 'audit', 'legal', 'profesional', 'jasa', 'service fee']),
  ('Persediaan & Bahan Baku', ARRAY['bahan baku', 'raw material', 'inventory', 'persediaan', 'stock', 'supplier', 'material', 'produksi', 'production', 'barang', 'goods']),
  ('Konsumsi & Jamuan', ARRAY['konsumsi', 'catering', 'makan', 'food', 'restaurant', 'restoran', 'cafe', 'coffee', 'jamuan', 'entertainment', 'meeting', 'rapat', 'client dinner', 'business lunch']),
  ('Pelatihan & Pengembangan', ARRAY['training', 'pelatihan', 'seminar', 'workshop', 'course', 'kursus', 'sertifikasi', 'certification', 'development', 'pengembangan', 'conference', 'konferensi']),
  ('Pajak & Perizinan', ARRAY['pajak', 'tax', 'pph', 'ppn', 'pbb', 'izin', 'license', 'permit', 'perizinan', 'retribusi', 'bea', 'customs']),
  ('Pemeliharaan & Perbaikan', ARRAY['maintenance', 'pemeliharaan', 'perbaikan', 'repair', 'service', 'bengkel', 'workshop', 'renovasi', 'renovation', 'fix']),
  ('Teknologi & Software', ARRAY['software', 'saas', 'subscription', 'langganan', 'cloud', 'hosting', 'domain', 'aplikasi', 'app', 'lisensi', 'license', 'teknologi', 'technology', 'it']),
  ('Asuransi', ARRAY['asuransi', 'insurance', 'premi', 'premium', 'coverage', 'perlindungan']),
  ('Biaya Bank & Administrasi', ARRAY['bank', 'admin', 'administrasi', 'fee', 'biaya', 'charge', 'transfer', 'atm', 'bunga', 'interest', 'denda', 'penalty']),
  ('Lain-lain', ARRAY[]::TEXT[])
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All tables, indexes, triggers, RLS policies, and seed data have been created/updated
