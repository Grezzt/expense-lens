# Database Migrations

This folder contains SQL migration files for the ExpenseLens database.

## Migration Files

Migrations are numbered sequentially and should be run in order:

1. **001_create_categories_table.sql** - Creates the `categories` table for storing expense categories and keywords
2. **002_seed_categories.sql** - Seeds initial business expense categories
3. **003_create_users_table.sql** - Creates the `users` table for user profiles
4. **004_create_organizations_table.sql** - Creates the `organizations` table for companies/teams
5. **005_create_organization_members_table.sql** - Creates the `organization_members` table for user-organization relationships with roles
6. **006_update_expenses_table.sql** - Adds `organization_id` and `created_by` columns to expenses table
7. **007_create_rls_policies.sql** - Implements Row Level Security policies for multi-tenant data isolation
8. **008_integrate_supabase_auth.sql** - Integrates Supabase Auth with users table using triggers

## How to Run Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order (001 → 007)
4. Execute each migration

### Using Supabase CLI

```bash
# Run all migrations in order
psql $DATABASE_URL -f migrations/001_create_categories_table.sql
psql $DATABASE_URL -f migrations/002_seed_categories.sql
psql $DATABASE_URL -f migrations/003_create_users_table.sql
psql $DATABASE_URL -f migrations/004_create_organizations_table.sql
psql $DATABASE_URL -f migrations/005_create_organization_members_table.sql
psql $DATABASE_URL -f migrations/006_update_expenses_table.sql
psql $DATABASE_URL -f migrations/007_create_rls_policies.sql
psql $DATABASE_URL -f migrations/008_integrate_supabase_auth.sql
```

## Migration Order

⚠️ **Important**: Always run migrations in numerical order (001 → 008)

## Data Migration

If you have existing expense data, uncomment the data migration block in `006_update_expenses_table.sql` to create a default organization and migrate existing expenses.

## Rollback

To rollback migrations, you'll need to manually drop tables or revert changes in reverse order:

```sql
-- Rollback 007 (RLS policies)
DROP POLICY IF EXISTS "Users can view organization expenses" ON expenses;
-- ... (drop other policies)

-- Rollback 006 (expenses columns)
ALTER TABLE expenses DROP COLUMN IF EXISTS organization_id;
ALTER TABLE expenses DROP COLUMN IF EXISTS created_by;

-- Rollback 005 (organization_members)
DROP TABLE IF EXISTS organization_members CASCADE;

-- Rollback 004 (organizations)
DROP TABLE IF EXISTS organizations CASCADE;

-- Rollback 003 (users)
DROP TABLE IF EXISTS users CASCADE;

-- Rollback 002 (category data)
DELETE FROM categories;

-- Rollback 001 (categories table)
DROP TABLE IF EXISTS categories CASCADE;
```
