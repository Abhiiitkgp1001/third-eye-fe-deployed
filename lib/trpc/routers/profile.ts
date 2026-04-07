import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

const ProfileSignalOutput = z.object({
  id: z.string(),
  userId: z.string(),
  data: z.unknown(),
  timestamp: z.number(),
});

const ProfileSignalInput = z.object({
  userId: z.string(),
  payload: z.unknown(),
});

export const profileRouter = router({
  /**
   * Fetch latest profile signal snapshot
   */
  get: publicProcedure
    .input(z.object({ userId: z.string() }))
    .output(ProfileSignalOutput)
    .query(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.get("/profile.get", {
          params: input,
        });

        const parsed = ProfileSignalOutput.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse profile signal response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: any) {
        console.error("Error fetching profile signal from backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch profile signal: ${error.message}`,
          cause: error,
        });
      }
    }),

  /**
   * Send a profile signal
   */
  send: publicProcedure
    .input(ProfileSignalInput)
    .mutation(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/profile.send", input);
        return response.data.result.data;
      } catch (error: any) {
        console.error("Error sending profile signal to backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send profile signal: ${error.message}`,
          cause: error,
        });
      }
    }),

  /**
   * Stream profile signal events (WebSocket subscription)
   * Note: WebSocket support is currently disabled in backend
   */
  onSignal: publicProcedure
    .input(z.object({ userId: z.string() }))
    .subscription(async function* ({ input }) {
      // This would use WebSocket when enabled in backend
      throw new TRPCError({
        code: "UNIMPLEMENTED",
        message: "WebSocket subscriptions are currently disabled in the backend",
      });
    }),
});
