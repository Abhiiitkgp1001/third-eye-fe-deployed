import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../trpc";
import { companyLists, companies } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";

export const companyListsRouter = router({
  /**
   * Get all company lists for the current user's organization
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const lists = await ctx.db
      .select()
      .from(companyLists)
      .where(eq(companyLists.orgId, ctx.orgId));

    return lists;
  }),

  /**
   * Get a single company list by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [list] = await ctx.db
        .select()
        .from(companyLists)
        .where(
          and(
            eq(companyLists.id, input.id),
            eq(companyLists.orgId, ctx.orgId)
          )
        );

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company list not found",
        });
      }

      // Get companies in this list
      const listCompanies = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.companyListId, input.id));

      return {
        ...list,
        companies: listCompanies,
      };
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newList] = await ctx.db
        .insert(companyLists)
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
      const [updatedList] = await ctx.db
        .update(companyLists)
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
            eq(companyLists.id, input.id),
            eq(companyLists.orgId, ctx.orgId)
          )
        )
        .returning();

      if (!updatedList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company list not found",
        });
      }

      return updatedList;
    }),

  /**
   * Delete a company list
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedList] = await ctx.db
        .delete(companyLists)
        .where(
          and(
            eq(companyLists.id, input.id),
            eq(companyLists.orgId, ctx.orgId)
          )
        )
        .returning();

      if (!deletedList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company list not found",
        });
      }

      return { success: true };
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
    .mutation(async ({ ctx, input }) => {
      // Verify list exists and belongs to user's organization
      const [list] = await ctx.db
        .select()
        .from(companyLists)
        .where(
          and(
            eq(companyLists.id, input.listId),
            eq(companyLists.orgId, ctx.orgId)
          )
        );

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company list not found",
        });
      }

      const [newCompany] = await ctx.db
        .insert(companies)
        .values({
          companyListId: input.listId,
          linkedinUrl: input.linkedinUrl,
          latestMetadata: input.metadata,
        })
        .returning();

      return newCompany;
    }),

  /**
   * Remove a company from a list
   */
  removeCompany: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedCompany] = await ctx.db
        .delete(companies)
        .where(eq(companies.id, input.companyId))
        .returning();

      if (!deletedCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      return { success: true };
    }),
});
