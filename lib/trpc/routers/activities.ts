import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

/**
 * Activities Router - Proxies LinkedIn activities data from backend
 */
export const activitiesRouter = router({
  /**
   * Fetch aggregated people data (profile + posts + comments + reactions)
   */
  peopleAggregated: publicProcedure
    .input(
      z.object({
        profileId: z.string().min(1, "Profile ID is required"),
        maxPosts: z.number().int().min(1).max(50).default(5),
        maxComments: z.number().int().min(0).max(100).default(10),
        maxReactions: z.number().int().min(0).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.get("/activities.peopleAggregated", {
          params: { input: JSON.stringify(input) },
        });

        return response.data.result.data;
      } catch (error: any) {
        console.error("Error fetching people aggregated data from backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch people aggregated data: ${error.message}`,
          cause: error,
        });
      }
    }),

  /**
   * Fetch aggregated company data (company + company posts + employee posts + engagement)
   */
  companyAggregated: publicProcedure
    .input(
      z.object({
        companyId: z.string().min(1, "Company ID is required"),
        maxPostsPerType: z.number().int().min(1).max(50).default(5),
        maxComments: z.number().int().min(0).max(100).default(10),
        maxReactions: z.number().int().min(0).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.get("/activities.companyAggregated", {
          params: { input: JSON.stringify(input) },
        });

        return response.data.result.data;
      } catch (error: any) {
        console.error("Error fetching company aggregated data from backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch company aggregated data: ${error.message}`,
          cause: error,
        });
      }
    }),
});
