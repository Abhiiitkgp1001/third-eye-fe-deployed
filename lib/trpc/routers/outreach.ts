import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

// Helper to safely extract error message from unknown error
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}

// Helper to check if error has axios response data
function hasResponseData(error: unknown): error is { response?: { data?: unknown; status?: number } } {
  return typeof error === "object" && error !== null && "response" in error;
}

// Helper to safely log errors without exposing sensitive data
function logErrorSafely(context: string, error: unknown): void {
  console.error(`${context}:`, {
    message: getErrorMessage(error),
    ...(hasResponseData(error) && {
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    }),
  });
}

// Schemas matching backend
const MessageFormatSchema = z.enum(["linkedin", "email"]);

const GeneratedMessageSchema = z.object({
  subject: z.string().nullable(),
  body: z.string(),
  tone: z.enum(["professional", "casual", "friendly"]),
  keyPoints: z.array(z.string()),
  reasoning: z.string(),
});

export const outreachRouter = router({
  /**
   * Generate a personalized LinkedIn or Email message for a profile
   */
  generateMessage: protectedProcedure
    .input(
      z.object({
        profileId: z.string(),
        userMessage: z.string().min(10).max(1000),
        format: MessageFormatSchema,
        companyContext: z.string().optional(),
      })
    )
    .output(GeneratedMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/outreach.generateMessage", {
          orgId: ctx.orgId,
          profileId: input.profileId,
          userMessage: input.userMessage,
          format: input.format,
          companyContext: input.companyContext,
        });

        const parsed = GeneratedMessageSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse message generation response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        logErrorSafely("Error generating message", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate message: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Generate messages for multiple profiles in batch
   */
  generateBatchMessages: protectedProcedure
    .input(
      z.object({
        profileIds: z.array(z.string()).min(1).max(50),
        userMessage: z.string().min(10).max(1000),
        format: MessageFormatSchema,
        companyContext: z.string().optional(),
      })
    )
    .output(
      z.array(
        z.object({
          profileId: z.string(),
          success: z.boolean(),
          message: GeneratedMessageSchema.nullable(),
          error: z.string().nullable(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/outreach.generateBatchMessages", {
          orgId: ctx.orgId,
          profileIds: input.profileIds,
          userMessage: input.userMessage,
          format: input.format,
          companyContext: input.companyContext,
        });

        // Parse as array of batch results
        const results = response.data.result.data;
        if (!Array.isArray(results)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend - expected array",
          });
        }

        return results;
      } catch (error: unknown) {
        logErrorSafely("Error generating batch messages", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate batch messages: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),
});
