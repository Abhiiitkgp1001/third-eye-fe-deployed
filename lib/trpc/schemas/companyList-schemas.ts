import { z } from "zod";
import { CompanyDataSchema } from "../../schemas/external";

// ── Enums ──────────────────────────────────────────────────────────────

export const SyncStatusSchema = z.enum(["DRAFT", "BUILDING", "ENRICHING", "NORMAL", "FAILED"]);
export const CadenceSchema = z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]);
export const CompanyMovementSchema = z.enum(["COMPANY_SNAPSHOT", "COMPANY_NOT_FOUND", "ENRICHMENT_FAILED"]);

// ── CompanyList Schema ─────────────────────────────────────────────────

export const MovementDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  // Data filtering configuration (required, defaults to company-only if null)
  dataSources: z.object({
    company: z.boolean(),  // Include company data
    posts: z.boolean(),    // Include posts data
  }).nullable(),
  // Specific company keys to extract (required, can be null)
  companyKeys: z.array(z.string()).nullable(),
  // Which post data to include (required, can be null)
  postKeys: z.object({
    activity: z.boolean(),   // Post content/metadata
    comments: z.boolean(),   // Comments on posts
    reactions: z.boolean(),  // Reactions on posts
  }).nullable(),
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
  // Phase 1: Minimal enrichment tracking
  enrichmentStartedAt: z.coerce.date().nullable(),
  enrichmentError: z.string().nullable(),
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
  latestMetadata: CompanyDataSchema.nullable(),
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
  // Mirrors MovementMetadataSchema from shiv/src/lib/webhooks/schemas.ts
  metadata: z.object({
    // AI confidence score (0-100) for how certain the validator is about the movement
    confidence: z.number().min(0).max(100).nullish(),
    // AI explanation of why this movement was or wasn't detected
    reasoning: z.string().nullish(),
    // Structured evidence array — each item describes one field-level change
    // (replaces the deprecated V1 "relevantData" flat record)
    // Mirrors MovementEvidenceSchema from shiv/src/lib/webhooks/schemas.ts
    evidence: z.array(z.object({
      // The company field that changed (e.g. "staff_info", "funding_data")
      field: z.string(),
      // Value before the change (null if field is new)
      previousValue: z.any().nullish(),
      // Value after the change (null if field was removed)
      currentValue: z.any().nullish(),
      // AI interpretation of what this change means in context of the movement
      interpretation: z.string().nullish(),
    })).nullish(),
    validatedAt: z.string().nullish(),
    validationModel: z.string().nullish(),
    validatorVersion: z.string().nullish(),
    previousCompany: z.any().nullish(),
    currentCompany: z.any().nullish(),
    // Which system produced this metadata: "ai_validation" or "enrichment"
    source: z.enum(["ai_validation", "enrichment"]).nullish(),
    // Error message if movement detection failed (e.g. ENRICHMENT_FAILED)
    error: z.string().nullish(),
  }).passthrough().nullish(),
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
