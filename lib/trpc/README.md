# tRPC Setup

This project uses tRPC for end-to-end type-safe API calls between the frontend and backend.

## Architecture

```
lib/trpc/
├── context.ts       # Creates context for each request (auth, db)
├── trpc.ts          # tRPC initialization and procedures
├── routers/
│   ├── _app.ts      # Main router combining all feature routers
│   ├── companyLists.ts  # Company list operations
│   └── peopleLists.ts   # People list operations
├── client.ts        # Client-side tRPC configuration
├── Provider.tsx     # React Query + tRPC provider component
└── index.ts         # Main exports
```

## Features

- **Type Safety**: Full TypeScript inference from backend to frontend
- **Authentication**: Integrated with Clerk authentication
- **Database**: Direct access to Drizzle ORM in procedures
- **Batching**: Automatic request batching with `httpBatchLink`
- **Serialization**: Uses `superjson` for Date, Map, Set, etc.

## Usage in Components

### Client Components

```typescript
"use client";

import { trpc } from "@/lib/trpc";

export default function CompanyListsPage() {
  // Query example
  const { data: lists, isLoading } = trpc.companyLists.getAll.useQuery();

  // Mutation example
  const createList = trpc.companyLists.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      trpc.useUtils().companyLists.getAll.invalidate();
    },
  });

  const handleCreate = () => {
    createList.mutate({
      name: "My New List",
      prompt: "Track Fortune 500 companies",
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {lists?.map((list) => (
        <div key={list.id}>{list.name}</div>
      ))}
      <button onClick={handleCreate}>Create List</button>
    </div>
  );
}
```

### Server Components

For server components, you can call tRPC procedures directly:

```typescript
import { appRouter } from "@/lib/trpc/routers/_app";
import { createContext } from "@/lib/trpc/context";

export default async function ServerPage() {
  const ctx = await createContext();
  const caller = appRouter.createCaller(ctx);

  const lists = await caller.companyLists.getAll();

  return (
    <div>
      {lists.map((list) => (
        <div key={list.id}>{list.name}</div>
      ))}
    </div>
  );
}
```

## Available Procedures

### Company Lists

- `companyLists.getAll` - Get all company lists
- `companyLists.getById({ id })` - Get single list with companies
- `companyLists.create({ name, prompt?, min?, max? })` - Create list
- `companyLists.update({ id, name?, prompt?, enabled?, min?, max? })` - Update list
- `companyLists.delete({ id })` - Delete list
- `companyLists.addCompany({ listId, linkedinUrl, metadata? })` - Add company
- `companyLists.removeCompany({ companyId })` - Remove company

### People Lists

- `peopleLists.getAll` - Get all people lists
- `peopleLists.getById({ id })` - Get single list with profiles
- `peopleLists.create({ name, prompt?, min?, max? })` - Create list
- `peopleLists.update({ id, name?, prompt?, enabled?, min?, max? })` - Update list
- `peopleLists.delete({ id })` - Delete list
- `peopleLists.addProfile({ listId, linkedinUrl, metadata? })` - Add profile
- `peopleLists.removeProfile({ profileId })` - Remove profile

## Creating New Routers

1. Create a new router file in `lib/trpc/routers/`
2. Define your procedures using `protectedProcedure` or `publicProcedure`
3. Add the router to `_app.ts`

Example:

```typescript
// lib/trpc/routers/analytics.ts
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const analyticsRouter = router({
  getStats: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Access database: ctx.db
      // Access user: ctx.userId
      return { views: 100, clicks: 50 };
    }),
});

// lib/trpc/routers/_app.ts
import { analyticsRouter } from "./analytics";

export const appRouter = router({
  companyLists: companyListsRouter,
  peopleLists: peopleListsRouter,
  analytics: analyticsRouter, // Add here
});
```

## Authentication

The context includes Clerk authentication:

- `ctx.orgId` - Current organization ID (null if not authenticated)

**Note**: All users are required to create an organization on sign-up, so `orgId` serves as the primary authentication identifier. There is no separate `userId` in the context.

Use the built-in procedures:

- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authentication (throws UNAUTHORIZED if not logged in / no orgId)

## Error Handling

```typescript
const { data, error, isError } = trpc.companyLists.getById.useQuery(
  { id: "123" },
  {
    onError: (error) => {
      if (error.data?.code === "NOT_FOUND") {
        console.log("List not found");
      }
    },
  }
);
```

## Optimistic Updates

```typescript
const utils = trpc.useUtils();

const updateList = trpc.companyLists.update.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.companyLists.getAll.cancel();

    // Snapshot the previous value
    const previousLists = utils.companyLists.getAll.getData();

    // Optimistically update
    utils.companyLists.getAll.setData(undefined, (old) =>
      old?.map((list) =>
        list.id === newData.id ? { ...list, ...newData } : list
      )
    );

    return { previousLists };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.companyLists.getAll.setData(undefined, context?.previousLists);
  },
  onSettled: () => {
    // Refetch after mutation
    utils.companyLists.getAll.invalidate();
  },
});
```
