-- Migration: Update expenses table for multi-tenancy
-- Description: Add organization_id and created_by columns to expenses table
-- Date: 2026-02-13

-- Add organization_id and created_by columns
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_organization_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);

-- Add comments
COMMENT ON COLUMN expenses.organization_id IS 'Organization that owns this expense';
COMMENT ON COLUMN expenses.created_by IS 'User who created/uploaded this expense';

-- For existing data: Create a default organization and migrate
-- This is optional - uncomment if you have existing data to migrate
/*
DO $$
DECLARE
  default_org_id UUID;
  default_user_id UUID;
BEGIN
  -- Create default organization for existing data
  INSERT INTO organizations (name, slug, description)
  VALUES ('Default Organization', 'default-org', 'Auto-created for data migration')
  RETURNING id INTO default_org_id;

  -- Create default user if needed
  INSERT INTO users (email, full_name)
  VALUES ('admin@example.com', 'System Admin')
  RETURNING id INTO default_user_id;

  -- Add default user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (default_org_id, default_user_id, 'owner');

  -- Update existing expenses
  UPDATE expenses
  SET organization_id = default_org_id,
      created_by = default_user_id
  WHERE organization_id IS NULL;
END $$;
*/
