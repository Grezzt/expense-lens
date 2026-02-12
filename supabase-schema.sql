-- ExpenseLens Database Schema for Supabase

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  raw_data JSONB,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'VERIFIED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - optional, for production
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on expenses" ON expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create Storage Bucket for expense images
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-images', 'expense-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for storage bucket to allow public access
CREATE POLICY "Public Access for expense images"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-images');

CREATE POLICY "Authenticated users can upload expense images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-images');

CREATE POLICY "Authenticated users can update expense images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'expense-images');

CREATE POLICY "Authenticated users can delete expense images"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-images');

-- Insert sample data for testing (optional)
INSERT INTO expenses (image_url, merchant_name, amount, category, date, status, raw_data)
VALUES
  ('https://example.com/receipt1.jpg', 'Indomaret', 50000, 'Belanja', '2024-02-10', 'VERIFIED', '{"items": ["Susu", "Roti"], "confidence": 0.95}'::jsonb),
  ('https://example.com/receipt2.jpg', 'Grab', 25000, 'Transportasi', '2024-02-09', 'DRAFT', '{"items": ["GrabCar"], "confidence": 0.88}'::jsonb);
