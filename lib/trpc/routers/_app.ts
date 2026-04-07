import { router } from "../trpc";
import { companyListsRouter } from "./companyLists";
import { peopleListsRouter } from "./peopleLists";
import { profileRouter } from "./profile";
import { vigilRouter } from "./vigil";
import { censusRouter } from "./census";
import { organizationRouter } from "./organization";
import { testRouter } from "./test";

/**
 * Main app router
 * Combines all feature routers
 */
export const appRouter = router({
  profile: profileRouter,
  vigil: vigilRouter,
  census: censusRouter,
  organization: organizationRouter,
  peopleList: peopleListsRouter,
  companyList: companyListsRouter,
  test: testRouter,
  // Legacy naming (deprecated, use peopleList and companyList instead)
  peopleLists: peopleListsRouter,
  companyLists: companyListsRouter,
});

export type AppRouter = typeof appRouter;
