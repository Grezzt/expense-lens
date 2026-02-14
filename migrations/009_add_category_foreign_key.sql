-- Migration: Add category_id foreign key to expenses table
-- Description: Replace category VARCHAR with category_id UUID foreign key
-- Date: 2026-02-15

-- Add category_id column
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);

-- Migrate existing data: match category names to category IDs
DO $$
DECLARE
  cat_record RECORD;
BEGIN
  FOR cat_record IN SELECT id, name FROM categories LOOP
    UPDATE expenses
    SET category_id = cat_record.id
    WHERE category = cat_record.name
    AND category_id IS NULL;
  END LOOP;
END $$;

-- Optional: Drop old category column after migration
-- Uncomment this after verifying data migration
-- ALTER TABLE expenses DROP COLUMN IF EXISTS category;

COMMENT ON COLUMN expenses.category_id IS 'Foreign key to categories table';
