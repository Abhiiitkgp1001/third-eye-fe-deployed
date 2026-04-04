import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../trpc";
import { peopleLists, profiles } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";

export const peopleListsRouter = router({
  /**
   * Get all people lists for the current user's organization
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const lists = await ctx.db
      .select()
      .from(peopleLists)
      .where(eq(peopleLists.orgId, ctx.orgId));

    return lists;
  }),

  /**
   * Get a single people list by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [list] = await ctx.db
        .select()
        .from(peopleLists)
        .where(
          and(
            eq(peopleLists.id, input.id),
            eq(peopleLists.orgId, ctx.orgId)
          )
        );

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "People list not found",
        });
      }

      // Get profiles in this list
      const listProfiles = await ctx.db
        .select()
        .from(profiles)
        .where(eq(profiles.peopleListId, input.id));

      return {
        ...list,
        profiles: listProfiles,
      };
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newList] = await ctx.db
        .insert(peopleLists)
        .values({
          orgId: ctx.orgId,
          name: input.name,
          prompt: input.prompt,
          min: input.min,
          max: input.max,
          enabled: false,
          syncStatus: "DRAFT",
          cadence: "MANUAL",
        })
        .returning();

      return newList;
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
      const [updatedList] = await ctx.db
        .update(peopleLists)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.prompt !== undefined && { prompt: input.prompt }),
          ...(input.enabled !== undefined && { enabled: input.enabled }),
          ...(input.min !== undefined && { min: input.min }),
          ...(input.max !== undefined && { max: input.max }),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(peopleLists.id, input.id),
            eq(peopleLists.orgId, ctx.orgId)
          )
        )
        .returning();

      if (!updatedList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "People list not found",
        });
      }

      return updatedList;
    }),

  /**
   * Delete a people list
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedList] = await ctx.db
        .delete(peopleLists)
        .where(
          and(
            eq(peopleLists.id, input.id),
            eq(peopleLists.orgId, ctx.orgId)
          )
        )
        .returning();

      if (!deletedList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "People list not found",
        });
      }

      return { success: true };
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
    .mutation(async ({ ctx, input }) => {
      // Verify list exists and belongs to user's organization
      const [list] = await ctx.db
        .select()
        .from(peopleLists)
        .where(
          and(
            eq(peopleLists.id, input.listId),
            eq(peopleLists.orgId, ctx.orgId)
          )
        );

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "People list not found",
        });
      }

      const [newProfile] = await ctx.db
        .insert(profiles)
        .values({
          peopleListId: input.listId,
          linkedinUrl: input.linkedinUrl,
          latestMetadata: input.metadata,
        })
        .returning();

      return newProfile;
    }),

  /**
   * Remove a profile from a list
   */
  removeProfile: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedProfile] = await ctx.db
        .delete(profiles)
        .where(eq(profiles.id, input.profileId))
        .returning();

      if (!deletedProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      return { success: true };
    }),
});
