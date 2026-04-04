# Database Migration Guide

## ✅ Current Status

Your database is **fully migrated** and ready to use!

All 7 tables have been created:
- ✅ `organizations`
- ✅ `companyLists`
- ✅ `peopleLists`
- ✅ `companies`
- ✅ `profiles`
- ✅ `movementsCompanyList`
- ✅ `movementsProfileList`

## Database Connection

**Database**: PostgreSQL (Supabase)
- **Host**: `db.naojfvqtiurghlsicrvt.supabase.co`
- **Port**: `5432` (direct) / `6543` (pooler)
- **Database**: `postgres`

Your app uses the **pooler connection** (port 6543) for all runtime operations.

## How Migrations Work

### 1. Generate Migration (After Schema Changes)

When you modify `lib/db/schema.ts`, generate a migration:

```bash
npm run db:generate
```

This creates a SQL file in `drizzle/` directory.

### 2. Apply Migration (Development)

**Option A: Direct Push (Fastest for Dev)**
```bash
npm run db:push
```
- Pushes schema changes directly
- No migration files generated
- Best for rapid development

**Option B: Run Migration Files**
```bash
npm run db:migrate
```
- Applies generated migration files
- Keeps migration history
- Best for production

### 3. View Database (Optional)

Open Drizzle Studio to browse your data:

```bash
npm run db:studio
```

Opens a web UI at http://localhost:4983

## tRPC Integration

Your app automatically uses the database via tRPC:

```typescript
// Client Component
import { trpc } from "@/lib/trpc";

function MyComponent() {
  // Automatically uses orgId from Clerk
  const { data: lists } = trpc.companyLists.getAll.useQuery();

  const createList = trpc.companyLists.create.useMutation({
    onSuccess: () => {
      // List created in database!
    }
  });

  return (
    <button onClick={() => createList.mutate({ name: "My List" })}>
      Create List
    </button>
  );
}
```

The `orgId` is automatically:
1. Extracted from Clerk session
2. Added to database records
3. Used to filter queries

## Common Tasks

### Check if Migration is Needed

```bash
npm run db:generate
```

If no changes, you'll see: "No schema changes detected"

### Reset Database (⚠️ Destructive)

To drop all tables and start fresh:

```sql
-- Run in Supabase SQL Editor or psql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then:
```bash
npm run db:push
```

### View Current Schema

```bash
npm run db:studio
```

Or connect with any PostgreSQL client:
```bash
psql "postgresql://postgres:MjuSmCeoh08fi2t0@db.naojfvqtiurghlsicrvt.supabase.co:5432/postgres"
```

## Schema Overview

### Core Tables

**organizations**
- Stores organization data
- `id` is used as `orgId` in other tables
- Auto-generated from Clerk

**companyLists** / **peopleLists**
- List metadata (name, prompt, settings)
- Linked to `orgId` (CASCADE delete)
- Has `enabled`, `syncStatus`, `cadence` fields

**companies** / **profiles**
- Individual tracked items
- Stores `linkedinUrl` and `latestMetadata`
- Linked to their respective lists

**movementsCompanyList** / **movementsProfileList**
- Event tracking (job changes, etc.)
- Stores movement type and metadata
- Linked to companies/profiles

## Troubleshooting

### Migration Hangs

If `db:push` or `db:migrate` hangs, the database might already be up-to-date. Check with:

```bash
npm run db:generate
```

If it says "No changes detected", your database is already migrated.

### Connection Errors

Verify credentials in `.env.local`:
- `PARVAT_HOST`
- `PARVAT_PORT`
- `PARVAT_USER`
- `PARVAT_PASSWORD`
- `PARVAT_DATABASE`

Test connection:
```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.naojfvqtiurghlsicrvt.supabase.co:5432/postgres"
```

### Foreign Key Errors

If you get FK constraint errors when creating lists, ensure the organization exists:

```sql
-- Check if org exists
SELECT * FROM organizations WHERE id = 'your-org-id';

-- Create org if missing
INSERT INTO organizations (id, name) VALUES ('your-org-id', 'Your Org Name');
```

## Next Steps

Your database is ready! You can now:

1. ✅ Start the dev server: `npm run dev`
2. ✅ Sign in and create lists
3. ✅ Data will be saved to PostgreSQL
4. ✅ Use Drizzle Studio to view data: `npm run db:studio`

## Migration Files

Migration files are stored in `/drizzle/`:
- `0000_glossy_stellaris.sql` - Initial schema
- Future migrations will be numbered sequentially

Keep these in version control to track schema changes over time.
