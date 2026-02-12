# ExpenseLens - AI Business Automation

🤖 **AI-Powered Expense Tracking & Business Automation**

ExpenseLens adalah aplikasi full-stack Next.js yang menggunakan AI (Gemini Vision) untuk mengotomatisasi tracking pengeluaran dari foto nota/struk.

## ✨ Features

- 📸 **Upload Receipt**: Drag & drop atau browse untuk upload foto nota
- 🤖 **AI Auto-Extraction**: Gemini Vision mengekstrak merchant, amount, date secara otomatis
- 🏷️ **Auto-Categorization**: Kategorisasi otomatis berdasarkan merchant name
- ✅ **Verification Workflow**: Review dan edit data sebelum finalisasi
- 📊 **Smart Reports**: Export ke Excel dengan summary dan breakdown
- 🎨 **Premium UI**: Modern, responsive design dengan dark mode support

## 🛠️ Tech Stack

- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3.x
- **AI**: LangChain 0.1.0 + Google Gemini Vision
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Export**: ExcelJS
- **Styling**: Tailwind CSS

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

1. **Node.js** v20.x (LTS)
2. **npm** atau **yarn**
3. Akun dan kredensial untuk:
   - **Supabase** (Database + Storage)
   - **Google AI** (Gemini API)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database & Storage (Supabase)

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema di Supabase SQL Editor:

```bash
# Copy isi file supabase-schema.sql ke SQL Editor
# Schema ini akan membuat:
# - Table expenses
# - Storage bucket 'expense-images'
# - Storage policies untuk public access
```

3. Dapatkan kredensial:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Setup Google AI (Gemini)

1. Buat project di [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate API Key
3. Copy `GOOGLE_AI_API_KEY`

### 4. Configure Environment Variables

Edit file `.env.local` dan isi dengan kredensial Anda:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Project Structure

```
expense-lens/
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # Upload image to Supabase Storage
│   │   ├── extract/route.ts     # AI extraction with Gemini
│   │   ├── expenses/route.ts    # CRUD operations
│   │   └── export/route.ts      # Excel export
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/
│   ├── UploadForm.tsx           # Upload interface
│   ├── ExpenseList.tsx          # Expense list with filters
│   ├── ExpenseCard.tsx          # Individual expense card
│   └── ExportButton.tsx         # Export functionality
├── lib/
│   ├── supabase.ts              # Supabase client & helpers
│   ├── storage.ts               # Supabase Storage service
│   ├── langchain.ts             # Gemini AI integration
│   └── export.ts                # Excel generation
├── supabase-schema.sql          # Database schema
├── package.json                 # Dependencies (strict versioning)
└── .env.local                   # Environment variables
```

## 🎯 Usage Flow

1. **Upload Receipt**: Drag & drop foto nota ke upload area
2. **AI Processing**: Gemini Vision mengekstrak data (merchant, amount, date, category)
3. **Review**: Data ditampilkan dengan status DRAFT
4. **Verify**: Edit jika perlu, lalu klik "Verify"
5. **Export**: Download laporan Excel untuk data yang sudah verified

## 🔧 Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📊 Database Schema

Table `expenses`:

- `id` (UUID): Primary key
- `image_url` (TEXT): Supabase Storage URL
- `merchant_name` (VARCHAR): Nama merchant
- `amount` (DECIMAL): Jumlah pengeluaran
- `category` (VARCHAR): Kategori (auto-categorized)
- `date` (DATE): Tanggal transaksi
- `raw_data` (JSONB): Data mentah dari AI
- `status` (ENUM): DRAFT atau VERIFIED
- `created_at`, `updated_at` (TIMESTAMP)

## 🤖 AI Auto-Categorization

Kategori otomatis berdasarkan merchant name:

- **Transportasi**: Grab, Gojek, Bensin, Parkir
- **Makanan & Minuman**: Restaurant, Cafe, Warung
- **Belanja**: Supermarket, Indomaret, Alfamart
- **Utilitas**: Listrik, Air, Internet
- **Kesehatan**: Hospital, Apotek, Klinik
- **Hiburan**: Cinema, Gym, Sport
- **Pendidikan**: Sekolah, Kampus, Buku
- **Lainnya**: Default category

## 📝 Notes

- Strict versioning digunakan untuk memenuhi requirement lomba
- Semua dependencies menggunakan versi exact (tanpa `^` atau `~`)
- Database menggunakan RLS (Row Level Security) untuk production
- Images disimpan di Supabase Storage dengan public access

## 🐛 Troubleshooting

**Error: Missing environment variables**

- Pastikan semua env variables di `.env.local` sudah diisi

**Error: Supabase connection failed**

- Cek URL dan Anon Key sudah benar
- Pastikan RLS policy sudah di-enable

**Error: Cloudinary upload failed**

- Verify API credentials
- Cek quota Cloudinary account

**Error: Gemini extraction failed**

- Pastikan Google AI API Key valid
- Cek quota API usage

## 📄 License

MIT License - Free to use for competition and learning purposes.

---

**Built with ❤️ for Business Automation Competition**
