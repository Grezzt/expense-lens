-- Migration: Seed initial categories
-- Description: Insert business expense categories for company accounting
-- Date: 2026-02-12
-- Purpose: Categories aligned with standard chart of accounts for business expenses

-- Insert business expense categories with their keywords
INSERT INTO categories (name, keywords) VALUES
  -- Operational Expenses
  ('Biaya Operasional', ARRAY['operasional', 'operational', 'utilities', 'listrik', 'pln', 'air', 'pdam', 'internet', 'wifi', 'telepon', 'phone', 'sewa', 'rent', 'maintenance', 'perawatan']),

  -- Payroll & Employee Benefits
  ('Gaji & Tunjangan', ARRAY['gaji', 'salary', 'payroll', 'tunjangan', 'allowance', 'bonus', 'insentif', 'incentive', 'lembur', 'overtime', 'bpjs', 'jamsostek']),

  -- Office Supplies & Equipment
  ('Perlengkapan Kantor', ARRAY['atk', 'stationery', 'office', 'kantor', 'printer', 'kertas', 'paper', 'tinta', 'ink', 'supplies', 'perlengkapan', 'furniture', 'meja', 'kursi']),

  -- Transportation & Travel
  ('Transportasi & Perjalanan Dinas', ARRAY['transportasi', 'transport', 'grab', 'gojek', 'uber', 'taxi', 'bensin', 'fuel', 'bbm', 'parkir', 'parking', 'tol', 'toll', 'tiket', 'ticket', 'hotel', 'penginapan', 'perjalanan', 'travel', 'dinas']),

  -- Marketing & Advertising
  ('Pemasaran & Iklan', ARRAY['marketing', 'pemasaran', 'iklan', 'advertising', 'promosi', 'promotion', 'branding', 'sosmed', 'social media', 'google ads', 'facebook ads', 'instagram', 'billboard', 'brosur', 'flyer']),

  -- Professional Services
  ('Jasa Profesional', ARRAY['konsultan', 'consultant', 'lawyer', 'pengacara', 'akuntan', 'accountant', 'notaris', 'audit', 'legal', 'profesional', 'jasa', 'service fee']),

  -- Inventory & Raw Materials
  ('Persediaan & Bahan Baku', ARRAY['bahan baku', 'raw material', 'inventory', 'persediaan', 'stock', 'supplier', 'material', 'produksi', 'production', 'barang', 'goods']),

  -- Meals & Entertainment (Business)
  ('Konsumsi & Jamuan', ARRAY['konsumsi', 'catering', 'makan', 'food', 'restaurant', 'restoran', 'cafe', 'coffee', 'jamuan', 'entertainment', 'meeting', 'rapat', 'client dinner', 'business lunch']),

  -- Training & Development
  ('Pelatihan & Pengembangan', ARRAY['training', 'pelatihan', 'seminar', 'workshop', 'course', 'kursus', 'sertifikasi', 'certification', 'development', 'pengembangan', 'conference', 'konferensi']),

  -- Taxes & Licenses
  ('Pajak & Perizinan', ARRAY['pajak', 'tax', 'pph', 'ppn', 'pbb', 'izin', 'license', 'permit', 'perizinan', 'retribusi', 'bea', 'customs']),

  -- Maintenance & Repairs
  ('Pemeliharaan & Perbaikan', ARRAY['maintenance', 'pemeliharaan', 'perbaikan', 'repair', 'service', 'bengkel', 'workshop', 'renovasi', 'renovation', 'fix']),

  -- Technology & Software
  ('Teknologi & Software', ARRAY['software', 'saas', 'subscription', 'langganan', 'cloud', 'hosting', 'domain', 'aplikasi', 'app', 'lisensi', 'license', 'teknologi', 'technology', 'it']),

  -- Insurance
  ('Asuransi', ARRAY['asuransi', 'insurance', 'premi', 'premium', 'coverage', 'perlindungan']),

  -- Bank Charges & Fees
  ('Biaya Bank & Administrasi', ARRAY['bank', 'admin', 'administrasi', 'fee', 'biaya', 'charge', 'transfer', 'atm', 'bunga', 'interest', 'denda', 'penalty']),

  -- Miscellaneous
  ('Lain-lain', ARRAY[]::TEXT[])
ON CONFLICT (name) DO NOTHING;
