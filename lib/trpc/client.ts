import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { type AppRouter } from "./routers/_app";

/**
 * Create the tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the base URL for tRPC requests
 */
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative URL
    return "";
  }

  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  // Assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Create tRPC client options
 */
export function getTRPCClientOptions() {
  return {
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  };
}
