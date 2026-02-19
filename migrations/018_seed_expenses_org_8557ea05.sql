-- ============================================
-- SEED DATA: 300 Random Expenses
-- Organization: PT Macro Shipping (Export-Import)
-- Organization ID: 8557ea05-30b0-4e46-9263-c08bf9c5f47a
-- Description: Perusahaan macro untuk pengelolaan barang export import untuk shipping barang
-- Date: 2026-02-20
-- ============================================

DO $$
DECLARE
  v_org_id UUID := '8557ea05-30b0-4e46-9263-c08bf9c5f47a';
  v_i INTEGER;

  -- Category arrays (name + id fetched dynamically)
  v_categories TEXT[] := ARRAY[
    'Biaya Operasional',
    'Gaji & Tunjangan',
    'Perlengkapan Kantor',
    'Transportasi & Perjalanan Dinas',
    'Pemasaran & Iklan',
    'Jasa Profesional',
    'Persediaan & Bahan Baku',
    'Konsumsi & Jamuan',
    'Pelatihan & Pengembangan',
    'Pajak & Perizinan',
    'Pemeliharaan & Perbaikan',
    'Teknologi & Software',
    'Asuransi',
    'Biaya Bank & Administrasi',
    'Lain-lain'
  ];

  -- Merchants per category (export-import shipping context)
  v_merchants_operasional TEXT[] := ARRAY[
    'PLN Nusantara Power', 'PDAM Tirta Dharma', 'Telkom Indonesia',
    'Indihome Business', 'First Media Corporate', 'MyRepublic Business',
    'PT Surya Energi', 'Dewa Ruci Gas', 'Pertamina Retail',
    'PT Sewa Gudang Pelabuhan', 'Properti Fasilitas Tanjung Priok',
    'Sewa Kantor CBD Jakarta', 'PT Logistik Warehouse'
  ];

  v_merchants_gaji TEXT[] := ARRAY[
    'BPJS Ketenagakerjaan', 'BPJS Kesehatan', 'Bank BCA Payroll',
    'Bank Mandiri Payroll', 'Bank BRI Business', 'Dana Pensiun Pelaut',
    'Tunjangan Hari Raya Karyawan', 'Insentif Tim Dokumentasi Ekspor',
    'Bonus Operator Forklift', 'Lembur Tim Bea Cukai', 'Jamsostek Cabang Jakarta'
  ];

  v_merchants_perlengkapan TEXT[] := ARRAY[
    'Gramedia Office', 'Ace Hardware', 'Tokopedia B2B Supplies',
    'Shopee Business', 'Indopart Office Supply', 'Raja Printer Jakarta',
    'Toko Brankas Gembok', 'CV Sari Kertas', 'PT Mitra Stationery',
    'Furniture Duta Kantor', 'Locker Industri Surabaya', 'Labeling Machine Store'
  ];

  v_merchants_transportasi TEXT[] := ARRAY[
    'Garuda Indonesia Cargo', 'Lion Air Cargo', 'Batik Air',
    'PT Pelni Shipping', 'Blue Bird Taxi', 'Grab Business',
    'Gojek Corporate', 'Shell Fuel Station', 'SPBU Pertamina Tanjung Priok',
    'Jasa Marga Tol', 'Parkir Pelabuhan Tanjung Priok', 'DHL Express',
    'FedEx Indonesia', 'JNE Cargo', 'Pos Logistik Indonesia',
    'Hotel Mercure Surabaya', 'Novotel Jakarta', 'Ibis Budget',
    'Tiket.com Business', 'Traveloka Corporate'
  ];

  v_merchants_marketing TEXT[] := ARRAY[
    'Google Ads Indonesia', 'Meta Business Suite', 'LinkedIn Marketing',
    'Kompas Media', 'Bisnis Indonesia', 'Kargo Technologies Ads',
    'Import Export Indonesia Magazine', 'Pameran Logistik Indonesia',
    'PT Kreatif Branding', 'Brosur Digital Print', 'Agency Digital Karang'
  ];

  v_merchants_jasa TEXT[] := ARRAY[
    'Kantor Hukum Suryadi & Partners', 'Konsultan Pajak Mitra',
    'KPMG Indonesia', 'Deloitte Konsultan', 'PwC Advisory',
    'Notaris Budi Santoso SH', 'Akuntan Publik Registered',
    'Konsultan Bea Cukai Nusantara', 'Jasa PPJK Tanjung Priok',
    'Surveyor Indonesia', 'PT Sucofindo', 'Ekspedisi Muatan Kapal Laut'
  ];

  v_merchants_persediaan TEXT[] := ARRAY[
    'PT Sumber Mas Plastik', 'CV Kemasan Karton Prima',
    'Indosat B2B Material', 'PT Packing Nusantara',
    'Supplier Bubble Wrap Jakarta', 'CV Kayu Palet Indonesia',
    'PT Steel Container Surabaya', 'Toko Forklift Spare Part',
    'Bahan Baku Tekstil Bandung', 'Gudang Besi Profil',
    'PT Kimia Dasar Industri', 'Supplier Tali Strapping'
  ];

  v_merchants_konsumsi TEXT[] := ARRAY[
    'Catering Nusantara', 'Restoran Prambanan Jakarta',
    'McDonald''s Meeting Room', 'Starbucks Reserve Sudirman',
    'Kopi Kenangan Corporate', 'Nasi Padang Sederhana',
    'Jamuan Makan Klien Ekspor', 'Business Lunch Port Area',
    'Catering Rapat Direksi', 'KFC Business Catering',
    'Cafe Amadeus Meeting', 'Sate Senayan Business'
  ];

  v_merchants_pelatihan TEXT[] := ARRAY[
    'LPPI Training Center', 'Prasetiya Mulya Executive',
    'PPM Manajemen', 'MarkPlus Institute',
    'Seminar Intralogistik Indonesia', 'Workshop Bea Cukai DJBC',
    'Pelatihan IATA Cargo', 'Sertifikasi FIATA Indonesia',
    'Kursus Bahasa Inggris Bisnis', 'Training K3 Kerja',
    'Conference Supply Chain Asia', 'Webinar Trade Finance'
  ];

  v_merchants_pajak TEXT[] := ARRAY[
    'Kantor Pelayanan Pajak Pratama', 'DJP Online PPh 21',
    'DJBC Bea Cukai Jakarta', 'Bea Masuk Impor Barang',
    'Izin Usaha Perdagangan BKPM', 'Angka Pengenal Importir',
    'SIUP Perpanjangan', 'NPWP Perusahaan Update',
    'Retribusi Pelabuhan KBS', 'Customs Duty Payment',
    'PPN Import Settlement', 'Larangan & Pembatasan BAPBTI'
  ];

  v_merchants_pemeliharaan TEXT[] := ARRAY[
    'Bengkel Forklift Surabaya', 'Service AC Gedung',
    'Teknisi Komputer & Server', 'PT Guna Widya Teknik',
    'Renovasi Gudang Barat', 'Perbaikan Conveyor Belt',
    'Service Generator Genset', 'Cat & Perawatan Gedung',
    'Perbaikan Crane Pelabuhan', 'Teknisi Lift & Escalator',
    'Maintenance Truk Fuso', 'Bengkel Las Besi Jakarta'
  ];

  v_merchants_teknologi TEXT[] := ARRAY[
    'Microsoft 365 Business', 'Google Workspace Enterprise',
    'Salesforce CRM', 'SAP Business One',
    'Accurate Online ERP', 'Jurnal.id Accounting',
    'Hostinger Business Hosting', 'Domainesia Cloud',
    'Adobe Creative Cloud', 'Zoom Business Premium',
    'Slack Premium', 'Trello Business', 'Odoo ERP',
    'WMS Software Warehouse Pro', 'Oracle NetSuite'
  ];

  v_merchants_asuransi TEXT[] := ARRAY[
    'Asuransi Jasindo Cargo', 'Asuransi Allianz Marine',
    'PT Asuransi Jasa Indonesia', 'Asuransi Wahana Tata',
    'MSIG Marine Insurance', 'Asuransi Maipark',
    'Asuransi Kredit Ekspor LPEI', 'AXA Insurance Business',
    'Zurich Insurance Marine Cargo', 'Asuransi Sinar Mas'
  ];

  v_merchants_bank TEXT[] := ARRAY[
    'Bank Mandiri Transfer Fee', 'Bank BCA Admin Bulanan',
    'Bank BNI Trade Finance', 'Bank BRI L/C Fee',
    'CIMB Niaga Business Fee', 'Bunga Kredit Modal Kerja',
    'Biaya LC Letter of Credit', 'Bank BCA Dollar Account',
    'Bank Mandiri SWIFT Transfer', 'Denda Keterlambatan Cicilan',
    'Biaya ATM BNI', 'Biaya Transfer RTGS'
  ];

  v_merchants_lain TEXT[] := ARRAY[
    'Pengeluaran Tak Terduga', 'Miscellaneous Expense',
    'Biaya Representasi Umum', 'Sumbangan & Donasi Perusahaan',
    'Biaya Keamanan Satpam', 'Keperluan Darurat Operasional',
    'Biaya Pos & Pengiriman Dokumen', 'Materai & Legalisasi',
    'Biaya Perjalanan Lainnya', 'Biaya Umum Lainnya'
  ];

  -- Dynamic variables
  v_cat_name TEXT;
  v_cat_id UUID;
  v_merchant TEXT;
  v_merchant_idx INTEGER;
  v_amount DECIMAL(12,2);
  v_date DATE;
  v_status VARCHAR(20);
  v_random_cat INTEGER;
  v_raw_data JSONB;
  v_note TEXT;
  v_ref_number TEXT;
  v_currency TEXT;

  -- Notes per category
  v_notes_operasional TEXT[] := ARRAY[
    'Tagihan bulanan utilitas gudang',
    'Biaya sewa fasilitas pelabuhan',
    'Pembayaran internet dedicated line',
    'Tagihan listrik area kantor dan gudang',
    'Sewa ruang kantor operasional'
  ];
  v_notes_gaji TEXT[] := ARRAY[
    'Pembayaran gaji bulanan karyawan operasional',
    'Tunjangan hari raya karyawan',
    'Premi BPJS Kesehatan dan Ketenagakerjaan',
    'Lembur tim dokumentasi ekspor impor',
    'Insentif performa tim logistik'
  ];
  v_notes_transportasi TEXT[] := ARRAY[
    'Tiket penerbangan perjalanan dinas ke Surabaya',
    'Biaya BBM armada truk pengiriman',
    'Ongkos tol dan parkir pengiriman barang',
    'Biaya hotel perjalanan dinas ke pelabuhan',
    'Pengiriman dokumen ekspor via kurir ekspres'
  ];
  v_notes_persediaan TEXT[] := ARRAY[
    'Pembelian kemasan packing barang ekspor',
    'Palet kayu untuk pengiriman kontainer',
    'Bahan strapping dan wrapping barang',
    'Pembelian spare part forklift',
    'Material gudang dan perlengkapan bongkar muat'
  ];
  v_notes_pajak TEXT[] := ARRAY[
    'Pembayaran PPh 21 bulanan',
    'Bea masuk impor barang dari Tiongkok',
    'Perpanjangan izin usaha perdagangan',
    'PPN import settlement',
    'Retribusi pelabuhan dan dokumen kepabeanan'
  ];

  v_note_used TEXT;

BEGIN
  FOR v_i IN 1..300 LOOP

    -- Pick a random category index (weight: give more weight to common categories)
    v_random_cat := 1 + floor(random() * 15)::INTEGER;
    IF v_random_cat > 15 THEN v_random_cat := 15; END IF;

    v_cat_name := v_categories[v_random_cat];

    -- Get category id from categories table
    SELECT id INTO v_cat_id FROM categories WHERE name = v_cat_name LIMIT 1;

    -- Pick merchant based on category
    CASE v_random_cat
      WHEN 1 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_operasional, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_operasional, 1) THEN v_merchant_idx := array_length(v_merchants_operasional, 1); END IF;
        v_merchant := v_merchants_operasional[v_merchant_idx];
        v_amount := (500000 + floor(random() * 9500000))::DECIMAL;
        v_note_used := v_notes_operasional[1 + floor(random() * 5)::INTEGER];

      WHEN 2 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_gaji, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_gaji, 1) THEN v_merchant_idx := array_length(v_merchants_gaji, 1); END IF;
        v_merchant := v_merchants_gaji[v_merchant_idx];
        v_amount := (2000000 + floor(random() * 48000000))::DECIMAL;
        v_note_used := v_notes_gaji[1 + floor(random() * 5)::INTEGER];

      WHEN 3 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_perlengkapan, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_perlengkapan, 1) THEN v_merchant_idx := array_length(v_merchants_perlengkapan, 1); END IF;
        v_merchant := v_merchants_perlengkapan[v_merchant_idx];
        v_amount := (50000 + floor(random() * 2950000))::DECIMAL;
        v_note_used := 'Pembelian perlengkapan dan alat tulis kantor';

      WHEN 4 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_transportasi, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_transportasi, 1) THEN v_merchant_idx := array_length(v_merchants_transportasi, 1); END IF;
        v_merchant := v_merchants_transportasi[v_merchant_idx];
        v_amount := (100000 + floor(random() * 9900000))::DECIMAL;
        v_note_used := v_notes_transportasi[1 + floor(random() * 5)::INTEGER];

      WHEN 5 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_marketing, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_marketing, 1) THEN v_merchant_idx := array_length(v_merchants_marketing, 1); END IF;
        v_merchant := v_merchants_marketing[v_merchant_idx];
        v_amount := (500000 + floor(random() * 14500000))::DECIMAL;
        v_note_used := 'Biaya iklan dan promosi layanan shipping';

      WHEN 6 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_jasa, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_jasa, 1) THEN v_merchant_idx := array_length(v_merchants_jasa, 1); END IF;
        v_merchant := v_merchants_jasa[v_merchant_idx];
        v_amount := (1000000 + floor(random() * 29000000))::DECIMAL;
        v_note_used := 'Pembayaran jasa profesional dan konsultasi';

      WHEN 7 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_persediaan, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_persediaan, 1) THEN v_merchant_idx := array_length(v_merchants_persediaan, 1); END IF;
        v_merchant := v_merchants_persediaan[v_merchant_idx];
        v_amount := (200000 + floor(random() * 49800000))::DECIMAL;
        v_note_used := v_notes_persediaan[1 + floor(random() * 5)::INTEGER];

      WHEN 8 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_konsumsi, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_konsumsi, 1) THEN v_merchant_idx := array_length(v_merchants_konsumsi, 1); END IF;
        v_merchant := v_merchants_konsumsi[v_merchant_idx];
        v_amount := (50000 + floor(random() * 2950000))::DECIMAL;
        v_note_used := 'Biaya makan dan jamuan klien bisnis';

      WHEN 9 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_pelatihan, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_pelatihan, 1) THEN v_merchant_idx := array_length(v_merchants_pelatihan, 1); END IF;
        v_merchant := v_merchants_pelatihan[v_merchant_idx];
        v_amount := (500000 + floor(random() * 14500000))::DECIMAL;
        v_note_used := 'Biaya pelatihan dan pengembangan SDM';

      WHEN 10 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_pajak, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_pajak, 1) THEN v_merchant_idx := array_length(v_merchants_pajak, 1); END IF;
        v_merchant := v_merchants_pajak[v_merchant_idx];
        v_amount := (100000 + floor(random() * 99900000))::DECIMAL;
        v_note_used := v_notes_pajak[1 + floor(random() * 5)::INTEGER];

      WHEN 11 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_pemeliharaan, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_pemeliharaan, 1) THEN v_merchant_idx := array_length(v_merchants_pemeliharaan, 1); END IF;
        v_merchant := v_merchants_pemeliharaan[v_merchant_idx];
        v_amount := (200000 + floor(random() * 19800000))::DECIMAL;
        v_note_used := 'Biaya pemeliharaan dan perbaikan aset perusahaan';

      WHEN 12 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_teknologi, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_teknologi, 1) THEN v_merchant_idx := array_length(v_merchants_teknologi, 1); END IF;
        v_merchant := v_merchants_teknologi[v_merchant_idx];
        v_amount := (100000 + floor(random() * 4900000))::DECIMAL;
        v_note_used := 'Langganan software dan layanan teknologi';

      WHEN 13 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_asuransi, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_asuransi, 1) THEN v_merchant_idx := array_length(v_merchants_asuransi, 1); END IF;
        v_merchant := v_merchants_asuransi[v_merchant_idx];
        v_amount := (500000 + floor(random() * 29500000))::DECIMAL;
        v_note_used := 'Premi asuransi kargo dan marine cargo';

      WHEN 14 THEN
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_bank, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_bank, 1) THEN v_merchant_idx := array_length(v_merchants_bank, 1); END IF;
        v_merchant := v_merchants_bank[v_merchant_idx];
        v_amount := (10000 + floor(random() * 990000))::DECIMAL;
        v_note_used := 'Biaya administrasi dan layanan perbankan';

      ELSE -- 15 = Lain-lain
        v_merchant_idx := 1 + floor(random() * array_length(v_merchants_lain, 1))::INTEGER;
        IF v_merchant_idx > array_length(v_merchants_lain, 1) THEN v_merchant_idx := array_length(v_merchants_lain, 1); END IF;
        v_merchant := v_merchants_lain[v_merchant_idx];
        v_amount := (50000 + floor(random() * 4950000))::DECIMAL;
        v_note_used := 'Pengeluaran lain-lain operasional perusahaan';
    END CASE;

    -- Generate a random date within the last 12 months (Feb 2025 - Feb 2026)
    v_date := DATE '2025-02-20' + floor(random() * 365)::INTEGER;

    -- Random status: 70% VERIFIED, 30% DRAFT
    IF random() < 0.70 THEN
      v_status := 'VERIFIED';
    ELSE
      v_status := 'DRAFT';
    END IF;

    -- Reference number per document
    v_ref_number := 'EXP-' || to_char(v_date, 'YYYYMM') || '-' || lpad(v_i::TEXT, 4, '0');

    -- Build raw_data JSON
    v_raw_data := jsonb_build_object(
      'ref_number', v_ref_number,
      'note', v_note_used,
      'currency', 'IDR',
      'confidence', round((0.70 + random() * 0.30)::NUMERIC, 2),
      'source', 'manual_entry',
      'department', (ARRAY['Operasional', 'Keuangan', 'Logistik', 'Ekspor-Impor', 'HRD', 'IT', 'Marketing'])[1 + floor(random() * 7)::INTEGER],
      'approved_by', (ARRAY['Budi Santoso', 'Dewi Rahayu', 'Agus Permana', 'Sari Wulandari', 'Hendra Gunawan'])[1 + floor(random() * 5)::INTEGER]
    );

    -- Insert the expense record (no image)
    INSERT INTO expenses (
      organization_id,
      image_url,
      merchant_name,
      amount,
      category,
      category_id,
      date,
      status,
      raw_data,
      created_at,
      updated_at
    ) VALUES (
      v_org_id,
      '',  -- no image, empty string (NOT NULL constraint satisfied)
      v_merchant,
      v_amount,
      v_cat_name,
      v_cat_id,
      v_date,
      v_status,
      v_raw_data,
      NOW() - (random() * INTERVAL '365 days'),
      NOW() - (random() * INTERVAL '30 days')
    );

  END LOOP;

  RAISE NOTICE 'Successfully inserted 300 expense records for organization %', v_org_id;
END $$;
