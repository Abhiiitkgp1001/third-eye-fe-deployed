import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import {
  backendErrorFromAxios,
  isAxiosError,
  messageFromUnknown,
} from "../backend-axios-errors";
import { TRPCError } from "@trpc/server";

// Organization schema (should match backend schema)
const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().nullable(),
  webhookUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const organizationRouter = router({
  /**
   * Create a new organization
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        domain: z.string().min(1).max(255).nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/organization.create", input);

        const parsed = OrganizationSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse organization response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        console.error("Error creating organization in backend:", error);

        const backend = backendErrorFromAxios(error);
        if (backend?.error?.code === "CONFLICT") {
          throw new TRPCError({
            code: "CONFLICT",
            message: backend.error.message ?? "Organization already exists",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create organization: ${messageFromUnknown(error)}`,
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),

  /**
   * Get organization by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.get("/organization.get", {
          params: { input: JSON.stringify(input) },
        });

        const parsed = OrganizationSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse organization response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        console.error("Error fetching organization from backend:", error);

        if (isAxiosError(error) && error.response?.status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch organization: ${messageFromUnknown(error)}`,
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),

  /**
   * Update organization name (domain changes require admin)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/organization.update", input);

        const parsed = OrganizationSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse organization response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        console.error("Error updating organization in backend:", error);

        if (isAxiosError(error) && error.response?.status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update organization: ${messageFromUnknown(error)}`,
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),

  /**
   * Delete organization (requires manual review - contact support)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => {
      throw new TRPCError({
        code: "METHOD_NOT_SUPPORTED",
        message: "Organization deletion is not self-serve. Please contact team@tryhog.com to delete your organization.",
      });
    }),

  /**
   * Update organization webhook URL
   */
  updateWebhook: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        webhookUrl: z.string().url().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/organization.updateWebhook", input);

        const parsed = OrganizationSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse organization response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        console.error("Error updating webhook URL in backend:", error);

        if (isAxiosError(error) && error.response?.status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        const backend = backendErrorFromAxios(error);
        if (backend?.error?.code === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: backend.error.message ?? "Invalid webhook URL",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update webhook URL: ${messageFromUnknown(error)}`,
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),
});
