import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

const HeadcountSnapshotSchema = z.object({
  companyId: z.string(),
  headcount: z.number().nullable(),
  capturedAt: z.date(),
});

const CheckInputSchema = z.object({
  companyId: z.string().min(1),
  previousSnapshot: HeadcountSnapshotSchema.nullable(),
  options: z
    .object({
      growthPercentThreshold: z.number().positive().optional(),
      declinePercentThreshold: z.number().negative().optional(),
      absoluteFloor: z.number().nonnegative().optional(),
    })
    .optional(),
});

const CheckOutputSchema = z.object({
  currentSnapshot: HeadcountSnapshotSchema,
  signal: z
    .object({
      signal: z.enum(["HEADCOUNT_GROWTH", "HEADCOUNT_DECLINE"]),
      companyId: z.string(),
      absoluteDelta: z.number().nullable(),
      percentDelta: z.number().nullable(),
      firedAt: z.date(),
    })
    .nullable(),
});

export const censusRouter = router({
  /**
   * Check for headcount growth/decline signals
   * Fetches fresh data from EnrichGraph and returns delta + any fired signal
   */
  check: protectedProcedure
    .input(CheckInputSchema)
    .output(CheckOutputSchema)
    .query(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.get("/census.check", {
          params: { input: JSON.stringify(input) },
        });

        const parsed = CheckOutputSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse census check response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: any) {
        console.error("Error checking headcount signal from backend:", error);

        if (error.response?.status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Company ${input.companyId} not found in EnrichGraph`,
          });
        }

        if (error.response?.status === 502) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: `Failed to fetch company data from EnrichGraph`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to check headcount signal: ${error.message}`,
          cause: error,
        });
      }
    }),
});
