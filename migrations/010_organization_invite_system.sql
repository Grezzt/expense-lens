-- Migration: Organization Invite System
-- Description: Add invite codes and organization management features
-- Date: 2026-02-15

-- ============================================
-- ADD COLUMNS TO ORGANIZATIONS TABLE
-- ============================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- FUNCTION: Generate Invite Code
-- ============================================

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Auto-generate invite code on org creation
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code = generate_invite_code();
  END IF;

  -- Set default expiration to 30 days from now
  IF NEW.invite_expires_at IS NULL THEN
    NEW.invite_expires_at = NOW() + INTERVAL '30 days';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-generate invite code
-- ============================================

DROP TRIGGER IF EXISTS trigger_auto_generate_invite_code ON organizations;

CREATE TRIGGER trigger_auto_generate_invite_code
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_invite_code();

-- ============================================
-- UPDATE EXISTING ORGANIZATIONS
-- ============================================

-- Generate invite codes for existing organizations
UPDATE organizations
SET
  invite_code = generate_invite_code(),
  invite_expires_at = NOW() + INTERVAL '30 days',
  is_active = true
WHERE invite_code IS NULL;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_organizations_invite_code ON organizations(invite_code);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN organizations.invite_code IS 'Unique 8-character invite code for joining organization';
COMMENT ON COLUMN organizations.invite_expires_at IS 'Expiration timestamp for invite code';
COMMENT ON COLUMN organizations.is_active IS 'Whether organization is active and accepting new members';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
