import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";

// Organization schema (should match backend schema)
const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
      } catch (error: any) {
        console.error("Error creating organization in backend:", error);

        if (error.response?.data?.error?.code === "CONFLICT") {
          throw new TRPCError({
            code: "CONFLICT",
            message: error.response.data.error.message || "Organization already exists",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create organization: ${error.message}`,
          cause: error,
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
          params: input,
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
      } catch (error: any) {
        console.error("Error fetching organization from backend:", error);

        if (error.response?.status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch organization: ${error.message}`,
          cause: error,
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
      } catch (error: any) {
        console.error("Error updating organization in backend:", error);

        if (error.response?.status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update organization: ${error.message}`,
          cause: error,
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
});
