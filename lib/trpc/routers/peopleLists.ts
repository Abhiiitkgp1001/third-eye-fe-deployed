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
  type GetAllPeopleListsResponse,
  type CreatePeopleListResponse,
  type GetPeopleListResponse,
  type ProfileOpResponse,
  type AddProfilesResponse,
} from "../schemas/peopleList-schemas";

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
      } catch (error: any) {
        console.error("Error fetching people lists from backend:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error response status:", error.response?.status);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch people lists from backend: ${error.message}`,
          cause: error,
        });
      }
    }),

  /**
   * Get a single people list by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(GetPeopleListResponseSchema)
    .query(async ({ ctx, input }): Promise<GetPeopleListResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.getList", {
          orgId: ctx.orgId,
          listId: input.id,
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
      } catch (error: any) {
        console.error("Error fetching people list from backend:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error response status:", error.response?.status);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `People list not found: ${error.message}`,
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
        profiles: z.array(z.object({
          type: z.enum(["slug", "liUrl"]),
          value: z.string(),
        })).min(1).default([{ type: "slug", value: "linkedin" }]),
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
        console.error("Error creating people list in backend:", error);
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
      // Backend doesn't have an update endpoint yet
      // For now, throw an error
      // throw new TRPCError({
      //   code: "UNIMPLEMENTED",
      //   message: "Update endpoint not implemented in backend yet",
      // });
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
        // Use profileOp with DELETE operation to remove the list
        await axios.post("/peopleList.profileOp", {
          op: "remove",
          peopleListId: input.id,
          orgId: ctx.orgId,
          operation: "DELETE_LIST",
        });
        return { success: true };
      } catch (error) {
        console.error("Error deleting people list from backend:", error);
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
        metadata: z.any().optional(),
      })
    )
    .output(ProfileOpResponseSchema)
    .mutation(async ({ ctx, input }): Promise<ProfileOpResponse> => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.profileOp", {
          op: "add",
          orgId: ctx.orgId,
          listId: input.listId,
          profile: {
            type: "liUrl",
            value: input.linkedinUrl,
          },
        });

        const parsed = ProfileOpResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("Failed to parse add profile response:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        console.error("Error adding profile to list in backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add profile to list",
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
        console.error("Error removing profile from backend:", error);
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
        console.error("Error adding profiles to list in backend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add profiles to list",
        });
      }
    }),
});
