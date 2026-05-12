import { appRouter } from "./routers/_app";
import { createContext } from "./context";

/**
 * Server-side tRPC caller for use in API routes
 * Creates a tRPC client that can be called directly on the server
 */
export async function createCaller() {
  const context = await createContext();
  return appRouter.createCaller(context);
}
