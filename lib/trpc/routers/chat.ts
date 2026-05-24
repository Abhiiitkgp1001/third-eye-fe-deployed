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

const ConversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const EvidenceItemSchema = z.object({
  name: z.string(),
  value: z.string(),
  detail: z.string().optional(),
  url: z.string().optional(),
});

const ChatResponseSchema = z.object({
  response: z.string(),
  visualizationType: z.enum(["table", "cards", "list", "text"]),
  evidence: z.array(EvidenceItemSchema),
  summary: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
  usage: z.any().optional(),
});

export const chatRouter = router({
  /**
   * Ask AI about a people list
   */
  askAboutPeopleList: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        question: z.string().min(1).max(2000),
        conversationHistory: z.array(ConversationMessageSchema).optional(),
      })
    )
    .output(ChatResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/chat.askAboutPeopleList", {
          orgId: ctx.orgId,
          listId: input.listId,
          question: input.question,
          conversationHistory: input.conversationHistory,
        });

        const parsed = ChatResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse chat response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        logErrorSafely("Error asking about people list", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get AI response: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Ask AI about a company list
   */
  askAboutCompanyList: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        question: z.string().min(1).max(2000),
        conversationHistory: z.array(ConversationMessageSchema).optional(),
      })
    )
    .output(ChatResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/chat.askAboutCompanyList", {
          orgId: ctx.orgId,
          listId: input.listId,
          question: input.question,
          conversationHistory: input.conversationHistory,
        });

        const parsed = ChatResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse chat response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        logErrorSafely("Error asking about company list", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get AI response: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),
});
