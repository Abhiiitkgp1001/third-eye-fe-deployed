import { router } from "../trpc";
import { companyListsRouter } from "./companyLists";
import { peopleListsRouter } from "./peopleLists";

/**
 * Main app router
 * Combines all feature routers
 */
export const appRouter = router({
  companyLists: companyListsRouter,
  peopleLists: peopleListsRouter,
});

export type AppRouter = typeof appRouter;
