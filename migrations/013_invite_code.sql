-- Add invite_code and invite_expires_at columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS invite_code text,
ADD COLUMN IF NOT EXISTS invite_expires_at timestamp with time zone;
-- Add unique constraint to invite_code
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS unique_invite_code;
ALTER TABLE organizations
ADD CONSTRAINT unique_invite_code UNIQUE (invite_code);
-- Check if generate_invite_code function exists, and drop it to allow return type change
DROP FUNCTION IF EXISTS generate_invite_code();

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$;
