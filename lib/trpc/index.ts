/**
 * Main export for tRPC client hooks
 * Use this in your components:
 *
 * import { trpc } from "@/lib/trpc";
 *
 * const { data, isLoading } = trpc.companyLists.getAll.useQuery();
 */
export { trpc } from "./client";
export { TRPCProvider } from "./Provider";
export type { AppRouter } from "./routers/_app";
