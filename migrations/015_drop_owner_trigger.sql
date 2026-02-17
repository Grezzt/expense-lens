-- Drop the trigger and function that prevents deleting the last owner
-- We are handling this validation in the application layer now (API/Services)
-- This is necessary to allow cascading deletes when an organization is deleted

DROP TRIGGER IF EXISTS ensure_owner_exists ON organization_members;
DROP FUNCTION IF EXISTS ensure_organization_has_owner();
