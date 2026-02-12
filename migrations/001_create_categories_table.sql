-- Migration: Create categories table
-- Description: Create categories table to store expense categories and their keywords
-- Date: 2026-02-12

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  keywords TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster category name lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE categories IS 'Stores expense categories and their associated keywords for auto-categorization';
COMMENT ON COLUMN categories.name IS 'Category name (e.g., Transportasi, Makanan & Minuman)';
COMMENT ON COLUMN categories.keywords IS 'Array of keywords used to match merchant names to this category';
