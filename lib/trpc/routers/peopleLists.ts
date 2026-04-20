import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getBackendAxios } from "../backend-client";
import { TRPCError } from "@trpc/server";
import {
  GetAllPeopleListsResponseSchema,
  CreatePeopleListResponseSchema,
  GetPeopleListResponseSchema,
  ProfileOpResponseSchema,
  AddProfilesResponseSchema,
  ValidateSignalsResponseSchema,
  MovementSchema,
  MovementDefinitionSchema,
  type GetAllPeopleListsResponse,
  type CreatePeopleListResponse,
  type GetPeopleListResponse,
  type ProfileOpResponse,
  type AddProfilesResponse,
  type ValidateSignalsResponse,
  type Movement,
} from "../schemas/peopleList-schemas";

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

export const peopleListsRouter = router({
  /**
   * Get all people lists for the current user's organization
   */
  getAll: protectedProcedure
    .output(GetAllPeopleListsResponseSchema)
    .query(async ({ ctx }): Promise<GetAllPeopleListsResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.getAllLists", {
          orgId: ctx.orgId,
        });

        const parsed = GetAllPeopleListsResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse people lists response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        logErrorSafely("Error fetching people lists from backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch people lists from backend: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Get a single people list by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().int().positive().max(1000).default(15),
        offset: z.number().int().min(0).default(0),
      })
    )
    .output(GetPeopleListResponseSchema)
    .query(async ({ ctx, input }): Promise<GetPeopleListResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.getList", {
          orgId: ctx.orgId,
          listId: input.id,
          limit: input.limit,
          offset: input.offset,
        });

        const parsed = GetPeopleListResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse people list response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error: unknown) {
        logErrorSafely("Error fetching people list from backend", error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `People list not found: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Create a new people list
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        prompt: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        movementDefinitions: z.array(MovementDefinitionSchema).optional(),
        cadence: z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
        cadenceInterval: z.number().int().positive().max(365).optional(),
        profiles: z.array(z.object({
          type: z.enum(["slug", "liUrl"]),
          value: z.string(),
        })).min(0).default([]),
      })
    )
    .output(CreatePeopleListResponseSchema)
    .mutation(async ({ ctx, input }): Promise<CreatePeopleListResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.create", {
          orgId: ctx.orgId,
          name: input.name,
          prompt: input.prompt,
          min: input.min,
          max: input.max,
          movementDefinitions: input.movementDefinitions,
          cadence: input.cadence,
          cadenceInterval: input.cadenceInterval,
          profiles: input.profiles,
        });

        const parsed = CreatePeopleListResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse create people list response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        logErrorSafely("Error creating people list in backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create people list",
        });
      }
    }),

  /**
   * Update a people list
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
        const response = await axios.post("/peopleList.update", {
          orgId: ctx.orgId,
          listId: id,
          patch,
        });

        return response.data.result.data;
      } catch (error) {
        logErrorSafely("Error updating people list in backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update people list",
        });
      }
    }),

  /**
   * Delete a people list
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const axios = await getBackendAxios();

      try {
        await axios.post("/peopleList.deleteList", {
          orgId: ctx.orgId,
          listId: input.id,
        });
        return { success: true };
      } catch (error) {
        logErrorSafely("Error deleting people list from backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete people list",
        });
      }
    }),

  /**
   * Add a profile to a list
   */
  addProfile: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        linkedinUrl: z.string().url(),
      })
    )
    .output(ProfileOpResponseSchema)
    .mutation(async ({ ctx, input }): Promise<ProfileOpResponse> => {
      const axios = await getBackendAxios();

      // Clean the LinkedIn URL using the same regex pattern as backend (@fiberai/common approach)
      const PROFILE_LI_SLUG_REGEX =
        /^(https?:\/\/)?(\w+\.)?linkedin\.\w+(\.\w+)?\/in\/(?<slug>[^/?#]+)\/?(\?.*)?(#.*)?$/iu;

      const cleanUrl = (rawUrl: string): string => {
        const match = PROFILE_LI_SLUG_REGEX.exec(rawUrl.trim());
        const slug = match?.groups?.["slug"];

        if (slug != null && slug !== "") {
          const cleaned = `https://www.linkedin.com/in/${slug}`;
          console.log(`[FE addProfile] Cleaning LinkedIn URL: "${rawUrl}" → "${cleaned}"`);
          return cleaned;
        }

        console.warn(`[FE addProfile] Could not extract slug from "${rawUrl}", using as-is`);
        return rawUrl;
      };

      const cleanedUrl = cleanUrl(input.linkedinUrl);

      try {
        console.log(`[FE addProfile] Sending to backend:`, {
          op: "add",
          orgId: ctx.orgId,
          listId: input.listId,
          profile: { type: "liUrl", value: cleanedUrl },
        });

        const response = await axios.post("/peopleList.profileOp", {
          op: "add",
          orgId: ctx.orgId,
          listId: input.listId,
          profile: {
            type: "liUrl",
            value: cleanedUrl,
          },
        });

        // console.log(`[FE addProfile] Backend response:`, {
        //   status: response.status,
        //   data: response.data,
        // });

        const parsed = ProfileOpResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("[FE addProfile] Failed to parse backend response:", parsed.error);
          console.error("[FE addProfile] Received data:", JSON.stringify(response.data.result.data, null, 2));
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        console.log(`[FE addProfile] Successfully parsed profile:`, parsed.data);
        return parsed.data;
      } catch (error: unknown) {
        logErrorSafely("Error adding profile to list in backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to add profile to list: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),

  /**
   * Remove a profile from a list
   */
  removeProfile: protectedProcedure
    .input(z.object({ profileId: z.string(), listId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const axios = await getBackendAxios();

      try {
        await axios.post("/peopleList.profileOp", {
          op: "remove",
          orgId: ctx.orgId,
          listId: input.listId,
          profileId: input.profileId,
        });
        return { success: true };
      } catch (error) {
        logErrorSafely("Error removing profile from backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove profile",
        });
      }
    }),

  /**
   * Add multiple profiles to a list (bulk upload)
   */
  addProfiles: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        linkedinUrls: z.array(z.string().url()).min(1),
      })
    )
    .output(AddProfilesResponseSchema)
    .mutation(async ({ ctx, input }): Promise<AddProfilesResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.addProfiles", {
          orgId: ctx.orgId,
          listId: input.listId,
          profiles: input.linkedinUrls.map((url) => ({
            type: "liUrl",
            value: url,
          })),
        });

        const parsed = AddProfilesResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse add profiles response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        logErrorSafely("Error adding profiles to list in backend", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add profiles to list",
        });
      }
    }),

  /**
   * Trigger immediate refresh/enrichment for a people list
   */
  triggerRefresh: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const axios = await getBackendAxios();

      try {
        await axios.post("/peopleList.triggerRefresh", {
          orgId: ctx.orgId,
          listId: input.id,
        });
        return { success: true };
      } catch (error) {
        logErrorSafely("Error triggering refresh for people list", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to trigger refresh",
        });
      }
    }),

  /**
   * Validate signals with AI for a people list
   */
  validateSignalsWithAI: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(ValidateSignalsResponseSchema)
    .mutation(async ({ ctx, input }): Promise<ValidateSignalsResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.validateSignalsWithAI", {
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
   * Get movements for a people list
   */
  getListMovements: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.array(MovementSchema))
    .query(async ({ ctx, input }): Promise<Movement[]> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.getListMovements", {
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
      } catch (error: unknown) {
        logErrorSafely("Error fetching movements", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch movements: ${getErrorMessage(error)}`,
          cause: error,
        });
      }
    }),
});
