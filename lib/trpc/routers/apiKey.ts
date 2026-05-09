import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

/**
 * API Key router - proxies requests to backend
 */
export const apiKeyRouter = router({
  /**
   * Create a new API key
   */
  create: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/apiKey.create", {
          orgId: ctx.orgId,
          name: input.name,
        });

        return response.data.result.data;
      } catch (error: unknown) {
        console.error("Error creating API key:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API key",
          cause: error,
        });
      }
    }),

  /**
   * Get all API keys for an organization
   */
  getAll: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ input, ctx }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/apiKey.getAll", {
          orgId: ctx.orgId,
        });

        return response.data.result.data;
      } catch (error: unknown) {
        console.error("Error fetching API keys:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch API keys",
          cause: error,
        });
      }
    }),

  /**
   * Delete an API key
   */
  delete: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        keyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/apiKey.delete", {
          orgId: ctx.orgId,
          keyId: input.keyId,
        });

        return response.data.result.data;
      } catch (error: unknown) {
        console.error("Error deleting API key:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete API key",
          cause: error,
        });
      }
    }),

  /**
   * Update an API key's name
   */
  updateName: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        keyId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/apiKey.updateName", {
          orgId: ctx.orgId,
          keyId: input.keyId,
          name: input.name,
        });

        return response.data.result.data;
      } catch (error: unknown) {
        console.error("Error updating API key name:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update API key name",
          cause: error,
        });
      }
    }),
});
