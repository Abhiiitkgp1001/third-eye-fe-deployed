import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc";
import { getBackendAxios } from "../../backend-client";
import { MovementDefinitionSchema as PeopleMovementDefinitionSchema } from "../../schemas/peopleList-schemas";
import { MovementDefinitionSchema as CompanyMovementDefinitionSchema } from "../../schemas/companyList-schemas";

const ProcessPromptForPeopleResponseSchema = z.object({
  movements: z.array(PeopleMovementDefinitionSchema),
});

const ProcessPromptForCompanyResponseSchema = z.object({
  movements: z.array(CompanyMovementDefinitionSchema),
});

/**
 * Prompts router — proxies to shiv's peopleList.processPrompt.
 * All AI logic lives in shiv; this is purely a pass-through.
 */
export const promptsRouter = router({
  processForPeopleList: protectedProcedure
    .input(z.object({ prompt: z.string().min(1).max(2000) }))
    .output(ProcessPromptForPeopleResponseSchema)
    .mutation(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/peopleList.processPrompt", {
          prompt: input.prompt,
        });

        const parsed = ProcessPromptForPeopleResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("[prompts.processForPeopleList] Bad response from shiv:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[prompts.processForPeopleList] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process prompt",
        });
      }
    }),

  processForCompanyList: protectedProcedure
    .input(z.object({ prompt: z.string().min(1).max(2000) }))
    .output(ProcessPromptForCompanyResponseSchema)
    .mutation(async ({ input }) => {
      const axios = await getBackendAxios();

      try {
        const response = await axios.post("/companyList.processPrompt", {
          prompt: input.prompt,
        });

        const parsed = ProcessPromptForCompanyResponseSchema.safeParse(response.data.result.data);
        if (!parsed.success) {
          console.error("[prompts.processForCompanyList] Bad response from backend:", parsed.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response from backend",
          });
        }

        return parsed.data;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[prompts.processForCompanyList] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process prompt",
        });
      }
    }),
});
