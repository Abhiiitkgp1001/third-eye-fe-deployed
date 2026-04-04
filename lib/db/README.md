# Database Setup

This project uses Drizzle ORM with PostgreSQL (Supabase).

## Environment Variables

This project uses **znv** (Zod Environment Variables) for type-safe environment validation. All environment variables are validated through `lib/util/env.ts`.

Configure the following in `.env.local`:

```env
# Environment
NODE_ENV=development

# Clerk Authentication
CLERK_SECRET_KEY_TEST=your-test-key
CLERK_SECRET_KEY_LIVE=your-live-key

# API Keys (optional)
API_SKELETON_KEY=
ENRICH_GRAPH_API_KEY=

# Database Configuration (Parvat - Supabase Postgres)
# Pooler connection (for normal operations - port 6543 PgBouncer transaction mode)
PARVAT_POOLER_HOST=your-pooler-host.supabase.co
PARVAT_POOLER_PORT=6543

# Direct connection (for migrations/introspection - port 5432)
PARVAT_HOST=your-project.supabase.co
PARVAT_PORT=5432
PARVAT_SUPABASE_DIRECT_CONNECTION_STRING=

# Credentials
PARVAT_USER=postgres
PARVAT_PASSWORD=your-database-password
PARVAT_DATABASE=postgres
```

### Environment Validation

The `lib/util/env.ts` file:
- Automatically loads `.env`, `.env.local` from multiple directory depths
- Validates all required environment variables using Zod schemas
- Strips surrounding quotes added by Docker
- Provides type-safe access to environment variables throughout the app

**Usage:**
```typescript
import { environment } from "@/lib/util/env";

// Type-safe access
const host = environment.PARVAT_HOST;
const port = environment.PARVAT_PORT; // Already coerced to number
```

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database (development)
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Schema

The schema includes the following tables:

- `organizations` - Organization/tenant data
- `peopleLists` - Tracked people lists
- `companyLists` - Tracked company lists
- `profiles` - LinkedIn profiles in people lists
- `companies` - LinkedIn companies in company lists
- `movementsProfileList` - Profile movement events
- `movementsCompanyList` - Company movement events

## Usage Examples

### In API Routes (App Router)

```typescript
import { db } from "@/lib/db/db";
import { peopleLists, companyLists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const lists = await db.select().from(peopleLists);
  return Response.json(lists);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newList = await db.insert(peopleLists).values({
    name: body.name,
    orgId: body.orgId,
  }).returning();

  return Response.json(newList[0]);
}
```

### In Server Actions

```typescript
"use server";

import { db } from "@/lib/db/db";
import { companyLists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCompanyLists(orgId: string) {
  const lists = await db
    .select()
    .from(companyLists)
    .where(eq(companyLists.orgId, orgId));

  return lists;
}
```

### In Server Components

```typescript
import { db } from "@/lib/db/db";
import { peopleLists } from "@/lib/db/schema";

export default async function ListsPage() {
  const lists = await db.select().from(peopleLists);

  return (
    <div>
      {lists.map(list => (
        <div key={list.id}>{list.name}</div>
      ))}
    </div>
  );
}
```

## Important Notes

- **Server-side only**: Database connections only work in Server Components, API Routes, and Server Actions
- **Pooler connection**: Use the default `db` export for all normal operations
- **Direct connection**: Use `createDirectDb()` only for migrations or special operations that require it
- **Transaction mode**: The pooler uses transaction mode, so prepared statements are disabled (`prepare: false`)
