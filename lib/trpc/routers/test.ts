import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

const PingResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
});

const AuthCheckResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
});

export const testRouter = router({
  /**
   * Unprotected ping endpoint to confirm server is up
   */
  ping: publicProcedure.query(async () => {
    const axios = await getBackendAxios();

    try {
      const response = await axios.get("/test.ping");

      const parsed = PingResponseSchema.safeParse(response.data.result.data);
      if (!parsed.success) {
        console.error("Failed to parse ping response:", parsed.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid response format from backend",
        });
      }

      return parsed.data;
    } catch (error: any) {
      console.error("Error pinging backend:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to ping backend: ${error.message}`,
        cause: error,
      });
    }
  }),

  /**
   * Protected endpoint to test authentication
   * Only succeeds with valid JWT or skeletonKey
   */
  authCheck: protectedProcedure.mutation(async () => {
    const axios = await getBackendAxios();

    try {
      const response = await axios.post("/test.authCheck");

      const parsed = AuthCheckResponseSchema.safeParse(response.data.result.data);
      if (!parsed.success) {
        console.error("Failed to parse auth check response:", parsed.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid response format from backend",
        });
      }

      return parsed.data;
    } catch (error: any) {
      console.error("Error checking auth in backend:", error);

      if (error.response?.status === 401) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication failed",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to check auth: ${error.message}`,
        cause: error,
      });
    }
  }),
});
