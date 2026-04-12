import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────────

export const SyncStatusSchema = z.enum(["DRAFT", "BUILDING", "ENRICHING", "NORMAL", "FAILED"]);
export const CadenceSchema = z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]);
export const CompanyMovementSchema = z.enum(["COMPANY_SNAPSHOT", "COMPANY_NOT_FOUND", "ENRICHMENT_FAILED"]);

// ── CompanyList Schema ─────────────────────────────────────────────────

export const MovementDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const CompanyListSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  enabled: z.boolean(),
  syncStatus: SyncStatusSchema,
  allowedMovements: z.array(z.string()).nullable(),
  movementDefinitions: z.array(MovementDefinitionSchema).nullable(),
  prompt: z.string().nullable(),
  cadence: CadenceSchema,
  cadenceInterval: z.number().default(10),
  nextRunAt: z.coerce.date().nullable(),
  lastRunAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  ordinal: z.number(),
});

export type CompanyList = z.infer<typeof CompanyListSchema>;
export type MovementDefinition = z.infer<typeof MovementDefinitionSchema>;

// ── Company Schema ─────────────────────────────────────────────────────

export const CompanySchema = z.object({
  id: z.string(),
  companyListId: z.string(),
  linkedinUrl: z.string(),
  latestMetadata: z.unknown().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  ordinal: z.number(),
});

export type Company = z.infer<typeof CompanySchema>;

// ── Movement Schema ────────────────────────────────────────────────────

export const MovementSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  linkedinUrl: z.string(),
  movement: z.string(),
  metadata: z.object({
    // AI validation fields (present on NO_CHANGE and custom movements)
    confidence: z.number().optional(),
    reasoning: z.string().optional(),
    relevantData: z.record(z.any()).optional(),
    validatedAt: z.string().optional(),
    validationModel: z.string().optional(),
    previousCompany: z.any().optional(),
    currentCompany: z.any().optional(),
    // Other fields for different movement types
  }).passthrough().nullable(),
  createdAt: z.coerce.date(),
});

export type Movement = z.infer<typeof MovementSchema>;

// ── Response Schemas ───────────────────────────────────────────────────

export const CompanyListWithCountSchema = CompanyListSchema.extend({
  companyCount: z.number(),
});

export const GetAllCompanyListsResponseSchema = z.array(CompanyListWithCountSchema);

export const CreateCompanyListResponseSchema = z.object({
  list: CompanyListSchema,
  insertedCount: z.number(),
});

export const GetCompanyListResponseSchema = z.object({
  list: CompanyListSchema,
  companies: z.array(CompanySchema),
  total: z.number(),
});

export const CompanyAddResponseSchema = z.object({
  company: CompanySchema,
});

export const CompanyRemoveResponseSchema = z.object({
  removed: z.literal(true),
});

export const CompanyOpResponseSchema = z.union([
  CompanyAddResponseSchema,
  CompanyRemoveResponseSchema,
]);

export const AddCompaniesResponseSchema = z.object({
  insertedCount: z.number(),
  skippedCount: z.number(),
});

export const ValidateSignalsResponseSchema = z.object({
  totalCompanies: z.number(),
  processedCompanies: z.number(),
  enriched: z.number(),
  unchanged: z.number(),
  movementsDetected: z.number(),
  failed: z.number(),
});

// ── Type exports ───────────────────────────────────────────────────────

export type GetAllCompanyListsResponse = z.infer<typeof GetAllCompanyListsResponseSchema>;
export type CreateCompanyListResponse = z.infer<typeof CreateCompanyListResponseSchema>;
export type GetCompanyListResponse = z.infer<typeof GetCompanyListResponseSchema>;
export type CompanyOpResponse = z.infer<typeof CompanyOpResponseSchema>;
export type AddCompaniesResponse = z.infer<typeof AddCompaniesResponseSchema>;
export type ValidateSignalsResponse = z.infer<typeof ValidateSignalsResponseSchema>;

// ── Helper functions ───────────────────────────────────────────────────────

export function formatCadence(cadence: z.infer<typeof CadenceSchema>, interval: number = 1): string {
  if (cadence === "MANUAL") return "Manual";
  if (interval === 1) {
    return cadence.charAt(0) + cadence.slice(1).toLowerCase();
  }
  const unit = cadence === "DAILY" ? "day" : cadence === "WEEKLY" ? "week" : "month";
  return `Every ${interval} ${unit}${interval > 1 ? "s" : ""}`;
}
