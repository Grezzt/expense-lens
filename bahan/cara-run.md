# ExpenseLens — Panduan Menjalankan Project

## Prasyarat

Pastikan semua alat berikut sudah terinstal sebelum memulai:

| Alat    | Versi Minimum | Cek Versi       |
| ------- | ------------- | --------------- |
| Node.js | 20.x LTS      | `node -v`       |
| npm     | 9.x           | `npm -v`        |
| Git     | 2.x           | `git --version` |

Akun & kredensial yang dibutuhkan:

- **Supabase** project → [supabase.com](https://supabase.com)
- **Google AI (Gemini)** API key → [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## 1. Clone Repository

```bash
git clone https://github.com/your-org/expense-lens.git
cd expense-lens
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

File `.env.example` sudah tersedia di root project sebagai template. Salin ke `.env.local`:

```bash
# Windows (PowerShell)
copy .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

Kemudian isi nilai yang dibutuhkan di `.env.local`:

```env
# ─── Supabase ───────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# ─── Database (untuk script migrasi otomatis) ───────────────
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# ─── Google AI (Gemini) ─────────────────────────────────────
GOOGLE_AI_API_KEY=<google-ai-api-key>

# ─── Application ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Nilai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` tersedia di
> Supabase Dashboard → **Settings → API**.

---

## 4. Setup Database (Supabase)

### a. Buat Storage Bucket

1. Buka Supabase Dashboard → **Storage**
2. Buat bucket baru bernama `expense-images`
3. Atur akses sesuai kebijakan organisasi (disarankan: **private** untuk production)

### b. Jalankan Migrasi Database (Otomatis)

Project menyediakan script migrasi otomatis yang menjalankan semua file SQL secara berurutan.

**Langkah 1 — Tambahkan `DATABASE_URL` ke `.env.local`**

Dapatkan connection string dari Supabase Dashboard → **Settings → Database → Connection string → URI**.

> Gunakan tab **"Direct connection"** (port **5432**), bukan "Connection pooler" (port 6543).
> Pooler tidak mendukung eksekusi DDL SQL seperti `CREATE TABLE`, `ALTER TABLE`, dll.

```env
DATABASE_URL=postgresql://postgres:<your-db-password>@db.<project-ref>.supabase.co:5432/postgres
```

**Langkah 2 — Install dependency migrasi**

```bash
npm install
```

**Langkah 3 — Preview migrasi (opsional, tanpa eksekusi)**

```bash
npm run migrate:dry
```

Output akan menampilkan daftar file SQL yang akan dieksekusi, tanpa melakukan perubahan apapun ke database.

**Langkah 4 — Jalankan migrasi**

```bash
npm run migrate
```

Script akan mengeksekusi 18 file migrasi secara berurutan dan menampilkan status tiap file:

```
[INFO] Found 18 migration file(s):
  01. 000_complete_schema.sql
  02. 001_create_categories_table.sql
  ...
  18. 017_fix_users_rls.sql

  Running 000_complete_schema.sql ... done
  Running 001_create_categories_table.sql ... done
  ...

[INFO] Migration complete. Success: 18 | Failed: 0
```

Jika salah satu file gagal, script berhenti otomatis dan menampilkan pesan error. Perbaiki masalahnya lalu jalankan ulang — file yang sudah berhasil aman untuk dijalankan kembali karena menggunakan `IF NOT EXISTS`.

**Reset database (opsional, HAPUS SEMUA DATA)**

```bash
npm run db:reset
```

Mengeksekusi `migrations/999_reset_database.sql`. Hanya gunakan di environment development.

> **Penting:** Row Level Security (RLS) wajib aktif di semua tabel. Jangan nonaktifkan RLS di environment production.

---

## 5. Menjalankan Aplikasi

### Development

```bash
npm run dev
```

Aplikasi tersedia di: [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build
npm run build

# Jalankan server production
npm start
```

### Lint

```bash
npm run lint
```

### Ringkasan Semua Script

| Command               | Deskripsi                                       |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Jalankan development server                     |
| `npm run build`       | Build untuk production                          |
| `npm start`           | Jalankan production server                      |
| `npm run lint`        | Jalankan ESLint                                 |
| `npm run migrate`     | Jalankan semua migrasi database secara otomatis |
| `npm run migrate:dry` | Preview daftar migrasi tanpa eksekusi           |
| `npm run db:reset`    | Reset database — **hanya untuk development**    |

---

## 6. Verifikasi Instalasi

Setelah server berjalan, lakukan pengecekan berikut:

| Halaman       | URL                                   | Ekspektasi                        |
| ------------- | ------------------------------------- | --------------------------------- |
| Landing page  | `http://localhost:3000`               | Halaman utama tampil              |
| Login         | `http://localhost:3000/login`         | Form login tampil                 |
| Register      | `http://localhost:3000/register`      | Form registrasi tampil            |
| Organizations | `http://localhost:3000/organizations` | Redirect ke login jika belum auth |

---

## 7. Alur Penggunaan Pertama Kali

1. **Register** akun baru di `/register`
2. **Buat organisasi** baru setelah login pertama
3. **Undang anggota** melalui menu Organization Settings menggunakan invite code
4. **Submit expense** melalui tombol scan di sidebar
5. **Approve / reject** expense melalui menu Approvals (role: Admin/Accountant)
6. **Export laporan** melalui menu Reports atau Accounting

---

## 8. Troubleshooting

**`Error: Missing Supabase environment variables`**

Pastikan `.env.local` sudah dibuat dan server di-restart setelah perubahan env.

**Halaman blank setelah login**

Cek apakah seluruh migrasi database sudah dijalankan, khususnya `007_create_rls_policies.sql` dan `008_integrate_supabase_auth.sql`.

**Upload receipt gagal**

Pastikan bucket `expense-images` sudah dibuat di Supabase Storage dan policy mengizinkan operasi insert dari authenticated user.

**Ekstraksi data receipt gagal / timeout**

- Verifikasi `GOOGLE_AI_API_KEY` valid di Google AI Studio
- Cek quota penggunaan Gemini API di Google Cloud Console
- Pastikan file upload bukan PDF terenkripsi atau gambar beresolusi sangat rendah

**Build gagal setelah ubah dependency**

```bash
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run build
```

---

## Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google AI Studio](https://aistudio.google.com)
- [LangChain JS Documentation](https://js.langchain.com/docs)
