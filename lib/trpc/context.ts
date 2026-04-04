import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";

/**
 * Creates context for tRPC requests.
 * Contains:
 * - db: Drizzle database instance
 * - orgId: Current organization ID from Clerk (null if not authenticated)
 *
 * Note: All users are required to create an organization on sign-up,
 * so orgId serves as the primary authentication identifier.
 */
export async function createContext() {
  const { orgId } = await auth();

  return {
    db,
    orgId,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
