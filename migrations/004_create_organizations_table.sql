-- Migration: Create organizations table
-- Description: Create organizations/companies table for multi-tenancy
-- Date: 2026-02-13

-- Create organizations table
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to table
COMMENT ON TABLE organizations IS 'Stores company/organization information for multi-tenancy';
COMMENT ON COLUMN organizations.name IS 'Organization name (e.g., PT. ABC Company)';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN organizations.description IS 'Organization description or notes';
COMMENT ON COLUMN organizations.settings IS 'JSON settings for organization preferences (currency, timezone, etc.)';
COMMENT ON COLUMN organizations.created_by IS 'User who created this organization';
