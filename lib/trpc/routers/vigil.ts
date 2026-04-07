import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

// Company Identifier
const CompanyLiIdentifier = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("slug"),
    value: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "LinkedIn slug must be lowercase alphanumeric with hyphens")
      .describe("LinkedIn company slug, e.g. 'microsoft'"),
  }),
  z.object({
    type: z.literal("orgId"),
    value: z
      .string()
      .trim()
      .min(1)
      .regex(/^(comp_)?\d+$/, "Must be a numeric org ID (e.g. '1441') or Fiber ID (e.g. 'comp_1441')")
      .describe("LinkedIn org ID or Fiber company ID, e.g. '1441' or 'comp_1441'"),
  }),
  z.object({
    type: z.literal("liUrl"),
    value: z
      .string()
      .trim()
      .url()
      .regex(/linkedin\.com\/(company|showcase|school|organization)\//, "Must be a LinkedIn company URL")
      .describe("LinkedIn company URL, e.g. 'https://www.linkedin.com/company/microsoft'"),
  }),
]);

// Signal Config
const SignalConfig = z.object({
  signals: z.array(z.string()).min(1, "At least one signal required"),
  cadence: z.enum(["REALTIME", "DAILY", "WEEKLY"]).default("DAILY"),
});

// Webhook Config
const WebhookConfig = z.object({
  url: z.string().url("Must be a valid webhook URL"),
  secret: z.string().min(16, "Secret must be at least 16 chars for HMAC signing"),
  deliveryMode: z.enum(["PER_SIGNAL", "BATCHED"]).default("PER_SIGNAL"),
  batchWindowMinutes: z.number().min(5).max(1440).optional(),
}).refine(
  (d) => d.deliveryMode === "BATCHED" ? d.batchWindowMinutes !== undefined : true,
  { message: "batchWindowMinutes required when deliveryMode is BATCHED" }
);

const CreateWatchlistInput = z.object({
  nativeOrganizationId: z.string(),
  name: z.string().min(1).max(100).describe("Name of the company watchlist"),
  companies: z.array(CompanyLiIdentifier).min(1).max(100),
  signalConfig: SignalConfig,
  webhook: WebhookConfig,
  rawPrompt: z.string().max(1000).optional(),
  expiresAt: z.date().min(new Date(), "Must be in the future").optional(),
});

export const vigilRouter = router({
  /**
   * Create a new company watchlist for monitoring signals
   */
  createWatchlist: protectedProcedure
    .input(CreateWatchlistInput)
    .mutation(async ({ ctx, input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/vigil.createWatchlist", input);
        return response.data.result.data;
      } catch (error: any) {
        console.error("Error creating watchlist in backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create watchlist: ${error.message}`,
          cause: error,
        });
      }
    }),
});
