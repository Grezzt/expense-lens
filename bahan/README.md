# ExpenseLens

**Enterprise Expense Management System**

ExpenseLens is a full-stack web application for managing organizational expenses. It supports multi-organization tenancy, role-based access control, automated receipt processing, approval workflows, and financial reporting.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Role & Permission Matrix](#role--permission-matrix)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

---

## Overview

ExpenseLens enables organizations to digitize and manage their expense processes end-to-end:

- **Receipt Scanning**: Upload receipt images; data is extracted and pre-filled automatically.
- **Expense Management**: Create, review, edit, and submit expense claims.
- **Approval Workflow**: Multi-level review with approve/reject actions.
- **Accounting Module**: Centralized view for accountants to oversee all transactions.
- **Reports & Export**: Generate and export financial reports to Excel.
- **Multi-Organization**: Supports multiple organizations under a single platform with isolated data per organization.
- **Role-Based Access Control (RBAC)**: Granular permission model across five roles.

---

## Tech Stack

| Layer            | Technology                  | Version  |
| ---------------- | --------------------------- | -------- |
| Framework        | Next.js (App Router)        | 14.1.0   |
| Language         | TypeScript                  | 5.7.2    |
| Database & Auth  | Supabase (PostgreSQL + RLS) | 2.39.3   |
| Storage          | Supabase Storage            | —        |
| State Management | Zustand                     | 5.x      |
| Charting         | Recharts                    | 2.x      |
| Export           | ExcelJS                     | 4.4.0    |
| Styling          | Tailwind CSS                | 3.4.1    |
| Runtime          | Node.js                     | 20.x LTS |

---

## Prerequisites

Ensure the following are available on your system before proceeding:

- **Node.js** v20.x LTS — [Download](https://nodejs.org/)
- **npm** v9+ (bundled with Node.js)
- **Supabase** project — [Create at supabase.com](https://supabase.com)
- **Google AI API Key** — [Generate at Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/expense-lens.git
cd expense-lens
```

### 2. Install dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ─── Supabase ───────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# ─── Google AI (Gemini) ─────────────────────────────────────
GOOGLE_AI_API_KEY=<your-google-ai-api-key>

# ─── Application ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Never commit `.env.local` to version control. It is already included in `.gitignore`.

---

## Database Setup

The database is hosted on Supabase. Schema and migration files are located in the `migrations/` directory and must be applied in order.

### Apply migrations

1. Open your Supabase project dashboard.
2. Navigate to **SQL Editor**.
3. Execute each migration file in numeric order:

```
migrations/
  000_complete_schema.sql          ← Base schema
  001_create_categories_table.sql
  002_seed_categories.sql
  003_create_users_table.sql
  004_create_organizations_table.sql
  005_create_organization_members_table.sql
  006_update_expenses_table.sql
  007_create_rls_policies.sql
  008_integrate_supabase_auth.sql
  009_add_category_foreign_key.sql
  010_organization_invite_system.sql
  011_fix_rls_recursion.sql
  012_fix_organizations_insert.sql
  013_invite_code.sql
  014_cascade_delete.sql
  015_drop_owner_trigger.sql
  016_fix_members_users_fk.sql
  017_fix_users_rls.sql
```

> **Important:** Row Level Security (RLS) is enforced on all tables. Do not disable it in production.

### Storage bucket

Create a storage bucket named `expense-images` in your Supabase project under **Storage**. Set the bucket visibility according to your organization's data policy (private is recommended for production).

---

## Running the Application

### Development

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

---

## Project Structure

```
expense-lens/
├── app/
│   ├── [orgSlug]/
│   │   └── (dashboard)/
│   │       ├── accounting/        # Accounting module
│   │       ├── approvals/         # Approval workflow
│   │       ├── dashboard/         # Main dashboard
│   │       ├── expenses/          # Expense management
│   │       ├── inbox/             # Notifications
│   │       ├── organization/      # Organization settings
│   │       └── reports/           # Financial reports
│   ├── api/
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── categories/            # Category management
│   │   ├── expenses/              # Expense CRUD
│   │   ├── export/                # Report export
│   │   ├── extract/               # Receipt data extraction
│   │   ├── organizations/         # Organization management
│   │   ├── upload/                # File upload
│   │   └── users/                 # User management
│   ├── login/                     # Login page
│   ├── register/                  # Registration page
│   └── organizations/             # Organization selection
├── components/
│   ├── dashboard/                 # Dashboard widgets
│   ├── expenses/                  # Expense components
│   ├── navigation/                # Sidebar, nav items
│   ├── approvals/                 # Approval components
│   ├── reports/                   # Report components
│   └── ui/                        # Shared UI components
├── hooks/
│   └── usePermissions.ts          # RBAC hook
├── lib/
│   ├── supabase.ts                # Supabase client & type definitions
│   ├── expense-service.ts         # Expense business logic
│   ├── organization-service.ts    # Organization business logic
│   ├── dashboard-service.ts       # Dashboard data service
│   ├── export-service.ts          # Export logic
│   ├── storage.ts                 # File storage service
│   ├── langchain.ts               # Receipt extraction service
│   └── rbac/
│       └── permissions.ts         # Role & permission definitions
├── migrations/                    # Ordered SQL migration files
├── store/
│   └── useAppStore.ts             # Global application state
├── .env.local                     # Environment variables (not committed)
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Role & Permission Matrix

| Permission             | Owner | Admin | Accountant | Member | Viewer |
| ---------------------- | :---: | :---: | :--------: | :----: | :----: |
| All permissions        |   ✓   |       |            |        |        |
| Manage users           |   ✓   |   ✓   |            |        |        |
| Manage policies        |   ✓   |   ✓   |            |        |        |
| Approve expenses       |   ✓   |   ✓   |     ✓      |        |        |
| Reject expenses        |   ✓   |       |     ✓      |        |        |
| View all expenses      |   ✓   |       |     ✓      |        |        |
| Export accounting data |   ✓   |       |     ✓      |        |        |
| View all reports       |   ✓   |   ✓   |            |        |   ✓    |
| Export reports         |   ✓   |   ✓   |            |        |   ✓    |
| Create expense         |   ✓   |       |            |   ✓    |        |
| View own expenses      |   ✓   |       |            |   ✓    |        |
| Delete own drafts      |   ✓   |       |            |   ✓    |        |
| View dashboard         |   ✓   |       |            |        |   ✓    |

---

## Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## Troubleshooting

**`Error: Missing Supabase environment variables`**

Verify that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local` and that the development server has been restarted after changes.

**Supabase connection failures**

- Confirm the project URL and anon key are correct in your Supabase dashboard under **Settings → API**.
- Ensure RLS policies are enabled. Check `migrations/007_create_rls_policies.sql` has been applied.

**File upload errors**

- Verify the `expense-images` storage bucket exists in your Supabase project.
- Check that the signing/access policies on the bucket allow the authenticated role to read and write.

**Receipt extraction failures**

- Confirm `GOOGLE_AI_API_KEY` is valid and the API is enabled in your Google Cloud project.
- Check for quota limits on the Gemini API at [Google AI Studio](https://aistudio.google.com).

**Build errors after dependency changes**

- Delete `.next/` and `node_modules/`, then run `npm install` followed by `npm run build`.

---

## License

This project is proprietary. Unauthorized distribution or reproduction is not permitted.
