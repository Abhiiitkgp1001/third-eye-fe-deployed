import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";
import {
  GetAllCompanyListsResponseSchema,
  CreateCompanyListResponseSchema,
  GetCompanyListResponseSchema,
  CompanyOpResponseSchema,
  AddCompaniesResponseSchema,
  ValidateSignalsResponseSchema,
  MovementSchema,
  type GetAllCompanyListsResponse,
  type CreateCompanyListResponse,
  type GetCompanyListResponse,
  type CompanyOpResponse,
  type AddCompaniesResponse,
  type ValidateSignalsResponse,
  type Movement,
} from "../schemas/companyList-schemas";

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

// Helper to safely log errors without exposing sensitive data (like auth tokens)
function logErrorSafely(context: string, error: unknown): void {
  console.error(`${context}:`, {
    message: getErrorMessage(error),
    ...(hasResponseData(error) && {
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    }),
  });
}

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
        logErrorSafely("Error fetching company lists from backend", error);
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
    .input(
      z.object({
        id: z.string(),
        limit: z.number().int().positive().max(1000).default(15),
        offset: z.number().int().min(0).default(0),
      })
    )
    .output(GetCompanyListResponseSchema)
    .query(async ({ ctx, input }): Promise<GetCompanyListResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.getList", {
          orgId: ctx.orgId,
          listId: input.id,
          limit: input.limit,
          offset: input.offset,
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
        logErrorSafely("Error fetching company list from backend", error);
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
        movementDefinitions: z.array(z.object({
          name: z.string(),
          description: z.string(),
        })).optional(),
        cadence: z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
        cadenceInterval: z.number().int().positive().max(365).optional(),
        companies: z.array(z.object({
          type: z.enum(["slug", "orgId", "liUrl"]),
          value: z.string(),
        })).min(0).default([]),
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
          movementDefinitions: input.movementDefinitions,
          cadence: input.cadence,
          cadenceInterval: input.cadenceInterval,
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
        logErrorSafely("Error creating company list in backend", error);
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
      const axios = await getBackendAxios();

      try {
        const { id, ...patch } = input;
        const response = await axios.post("/companyList.update", {
          orgId: ctx.orgId,
          listId: id,
          patch,
        });

        return response.data.result.data;
      } catch (error) {
        logErrorSafely("Error updating company list in backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update company list",
        });
      }
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
        await axios.post("/companyList.deleteList", {
          orgId: ctx.orgId,
          listId: input.id,
        });
        return { success: true };
      } catch (error) {
        logErrorSafely("Error deleting company list from backend", error);
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
        logErrorSafely("Error adding company to list in backend", error);
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
          companyId: input.companyId,
        });
        return { success: true };
      } catch (error) {
        logErrorSafely("Error removing company from backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove company",
        });
      }
    }),

  /**
   * Add multiple companies to a list (bulk upload)
   */
  addCompanies: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        linkedinUrls: z.array(z.string().url()).min(1),
      })
    )
    .output(AddCompaniesResponseSchema)
    .mutation(async ({ ctx, input }): Promise<AddCompaniesResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.addCompanies", {
          orgId: ctx.orgId,
          listId: input.listId,
          companies: input.linkedinUrls.map((url) => ({
            type: "liUrl",
            value: url,
          })),
        });

        const parsed = AddCompaniesResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse add companies response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        logErrorSafely("Error adding companies to list in backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add companies to list",
        });
      }
    }),

  /**
   * Trigger immediate refresh/enrichment for a company list
   */
  triggerRefresh: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const axios = await getBackendAxios();

      try {
        await axios.post("/companyList.triggerRefresh", {
          orgId: ctx.orgId,
          listId: input.id,
        });
        return { success: true };
      } catch (error) {
        logErrorSafely("Error triggering refresh for company list", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to trigger refresh",
        });
      }
    }),

  /**
   * Validate signals with AI for a company list
   */
  validateSignalsWithAI: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(ValidateSignalsResponseSchema)
    .mutation(async ({ ctx, input }): Promise<ValidateSignalsResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.validateSignalsWithAI", {
          orgId: ctx.orgId,
          listId: input.id,
        });

        const parsed = ValidateSignalsResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse validate signals response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        logErrorSafely("Error validating signals with AI", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to validate signals: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Get movements for a company list
   */
  getListMovements: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.array(MovementSchema))
    .query(async ({ ctx, input }): Promise<Movement[]> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.getListMovements", {
          orgId: ctx.orgId,
          listId: input.id,
        });

        const parsed = z.array(MovementSchema).safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse movements response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        logErrorSafely("Error fetching movements", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch movements: ${error}`,
          cause: error,
        });
      }
    }),
});
