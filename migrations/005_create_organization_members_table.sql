-- Migration: Create organization_members table
-- Description: Create many-to-many relationship between users and organizations with roles
-- Date: 2026-02-13

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'accountant', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);

-- Add comments to table
COMMENT ON TABLE organization_members IS 'Many-to-many relationship between users and organizations with role-based access';
COMMENT ON COLUMN organization_members.role IS 'User role: owner (full control), admin (manage members), accountant (manage expenses), member (create expenses), viewer (read-only)';

-- Create function to ensure at least one owner per organization
CREATE OR REPLACE FUNCTION ensure_organization_has_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent deleting or changing the last owner
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

-- Create trigger to ensure at least one owner
CREATE TRIGGER ensure_owner_exists
  BEFORE UPDATE OR DELETE ON organization_members
  FOR EACH ROW
  WHEN (OLD.role = 'owner')
  EXECUTE FUNCTION ensure_organization_has_owner();
