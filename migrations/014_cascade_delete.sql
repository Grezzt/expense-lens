-- Add ON DELETE CASCADE to organization_members
ALTER TABLE organization_members
DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey,
ADD CONSTRAINT organization_members_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE;

-- Add ON DELETE CASCADE to expenses
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS expenses_organization_id_fkey,
ADD CONSTRAINT expenses_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE;
