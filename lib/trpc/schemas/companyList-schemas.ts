import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────────

export const SyncStatusSchema = z.enum(["DRAFT", "BUILDING", "ENRICHING", "NORMAL", "FAILED"]);
export const CadenceSchema = z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]);

// ── CompanyList Schema ─────────────────────────────────────────────────

export const CompanyListSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  enabled: z.boolean(),
  syncStatus: SyncStatusSchema,
  allowedMovements: z.array(z.string()).nullable(),
  prompt: z.string().nullable(),
  cadence: CadenceSchema,
  nextRunAt: z.coerce.date().nullable(),
  lastRunAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  ordinal: z.number(),
});

export type CompanyList = z.infer<typeof CompanyListSchema>;

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

// ── Response Schemas ───────────────────────────────────────────────────

export const GetAllCompanyListsResponseSchema = z.array(CompanyListSchema);

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

// ── Type exports ───────────────────────────────────────────────────────

export type GetAllCompanyListsResponse = z.infer<typeof GetAllCompanyListsResponseSchema>;
export type CreateCompanyListResponse = z.infer<typeof CreateCompanyListResponseSchema>;
export type GetCompanyListResponse = z.infer<typeof GetCompanyListResponseSchema>;
export type CompanyOpResponse = z.infer<typeof CompanyOpResponseSchema>;
