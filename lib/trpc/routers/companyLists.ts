import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";
import {
  GetAllCompanyListsResponseSchema,
  CreateCompanyListResponseSchema,
  GetCompanyListResponseSchema,
  CompanyOpResponseSchema,
  type GetAllCompanyListsResponse,
  type CreateCompanyListResponse,
  type GetCompanyListResponse,
  type CompanyOpResponse,
} from "../schemas/companyList-schemas";

export const companyListsRouter = router({
  /**
   * Get all company lists for the current user's organization
   */
  getAll: protectedProcedure
    .output(GetAllCompanyListsResponseSchema)
    .query(async ({ ctx }): Promise<GetAllCompanyListsResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.getAllLists", {
          orgId: ctx.orgId,
        });

        const parsed = GetAllCompanyListsResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse company lists response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        console.error("Error fetching company lists from backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch company lists from backend: ${error instanceof Error ? error.message : String(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Get a single company list by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(GetCompanyListResponseSchema)
    .query(async ({ ctx, input }): Promise<GetCompanyListResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.getList", {
          listId: input.id,
        });

        const parsed = GetCompanyListResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse company list response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        console.error("Error fetching company list from backend:", error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Company list not found: ${error instanceof Error ? error.message : String(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Create a new company list
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        prompt: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        companies: z.array(z.object({
          type: z.enum(["slug", "orgId", "liUrl"]),
          value: z.string(),
        })).min(1).default([{ type: "slug", value: "microsoft" }]),
      })
    )
    .output(CreateCompanyListResponseSchema)
    .mutation(async ({ ctx, input }): Promise<CreateCompanyListResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.create", {
          orgId: ctx.orgId,
          name: input.name,
          prompt: input.prompt,
          min: input.min,
          max: input.max,
          companies: input.companies,
        });

        const parsed = CreateCompanyListResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse create company list response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        console.error("Error creating company list in backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create company list",
        });
      }
    }),

  /**
   * Update a company list
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(255).optional(),
        prompt: z.string().optional(),
        enabled: z.boolean().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Backend doesn't have an update endpoint yet
      // For now, throw an error
      // throw new TRPCError({
      //   code: "UNIMPLEMENTED",
      //   message: "Update endpoint not implemented in backend yet",
      // });
    }),

  /**
   * Delete a company list
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const axios = await getBackendAxios();

      try {
        // Use companyOp with DELETE operation to remove the list
        await axios.post("/companyList.companyOp", {
          op: "remove",
          companyListId: input.id,
          orgId: ctx.orgId,
          operation: "DELETE_LIST",
        });
        return { success: true };
      } catch (error) {
        console.error("Error deleting company list from backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete company list",
        });
      }
    }),

  /**
   * Add a company to a list
   */
  addCompany: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        linkedinUrl: z.string().url(),
        metadata: z.any().optional(),
      })
    )
    .output(CompanyOpResponseSchema)
    .mutation(async ({ ctx, input }): Promise<CompanyOpResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.companyOp", {
          op: "add",
          orgId: ctx.orgId,
          listId: input.listId,
          company: {
            type: "liUrl",
            value: input.linkedinUrl,
          },
        });

        const parsed = CompanyOpResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse add company response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        console.error("Error adding company to list in backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add company to list",
        });
      }
    }),

  /**
   * Remove a company from a list
   */
  removeCompany: protectedProcedure
    .input(z.object({ companyId: z.string(), listId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const axios = await getBackendAxios();

      try {
        await axios.post("/companyList.companyOp", {
          op: "remove",
          orgId: ctx.orgId,
          listId: input.listId,
          company: {
            type: "slug",
            value: input.companyId,
          },
        });
        return { success: true };
      } catch (error) {
        console.error("Error removing company from backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove company",
        });
      }
    }),
});
