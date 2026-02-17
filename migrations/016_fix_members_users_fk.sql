-- Fix Foreign Key Relationship between organization_members and users
-- This resolves the "Could not find a relationship between organization_members and users" error

ALTER TABLE organization_members
DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Also fix organization_members -> organizations relationship to be safe
ALTER TABLE organization_members
DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey;

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

-- Populate missing invite codes for existing organizations
-- This resolves the "NO-CODE" issue
UPDATE organizations
SET invite_code = generate_invite_code()
WHERE invite_code IS NULL OR invite_code = '';

-- Refresh Schema Cache (by notifying PostgREST)
NOTIFY pgrst, 'reload config';
