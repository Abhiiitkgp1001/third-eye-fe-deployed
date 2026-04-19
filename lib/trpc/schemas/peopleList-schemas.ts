import { z } from "zod";
import { ProfileDataSchema } from "../../schemas/external";

// ── Enums ──────────────────────────────────────────────────────────────

export const SyncStatusSchema = z.enum(["DRAFT", "BUILDING", "ENRICHING", "NORMAL", "FAILED"]);
export const CadenceSchema = z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]);
export const ProfileMovementSchema = z.enum(["PROFILE_ENRICHED", "PROFILE_NOT_FOUND", "ENRICHMENT_FAILED"]);

// ── PeopleList Schema ──────────────────────────────────────────────────

export const MovementDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type MovementDefinition = z.infer<typeof MovementDefinitionSchema>;

export const PeopleListSchema = z.object({
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
  cadenceInterval: z.number().default(1),
  nextRunAt: z.coerce.date().nullable(),
  lastRunAt: z.coerce.date().nullable(),
  // Phase 1: Minimal enrichment tracking
  enrichmentStartedAt: z.coerce.date().nullable(),
  enrichmentError: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  ordinal: z.number(),
});

export type PeopleList = z.infer<typeof PeopleListSchema>;

// ── Profile Metadata ───────────────────────────────────────────────────
// NOTE: ProfileData from schemas/external/profile.ts is the source of truth.
// It's properly typed via Zod and contains all fields needed for display.
// Use profile.latestMetadata directly (typed as ProfileData | null).

// ── Movement Schema ────────────────────────────────────────────────────

export const MovementSchema = z.object({
  id: z.string(),
  profileId: z.string(),
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
      // The profile field that changed (e.g. "headline", "experience", "summary")
      field: z.string(),
      // Value before the change (null if field is new)
      previousValue: z.any().nullish(),
      // Value after the change (null if field was removed)
      currentValue: z.any().nullish(),
      // AI interpretation of what this change means in context of the movement
      interpretation: z.string().nullish(),
    })).nullable().nullish(),
    validatedAt: z.string().nullish(),
    validationModel: z.string().nullish(),
    validatorVersion: z.string().nullish(),
    previousProfile: z.any().nullish(),
    currentProfile: z.any().nullish(),
    // Which system produced this metadata: "ai_validation" or "enrichment"
    source: z.enum(["ai_validation", "enrichment"]).nullish(),
    // Error message if movement detection failed (e.g. ENRICHMENT_FAILED)
    error: z.string().nullish(),
  }).passthrough().nullable(),
  createdAt: z.coerce.date(),
});

export type Movement = z.infer<typeof MovementSchema>;

// ── Profile Schema ─────────────────────────────────────────────────────

export const ProfileSchema = z.object({
  id: z.string(),
  peopleListId: z.string(),
  linkedinUrl: z.string(),
  latestMetadata: ProfileDataSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  ordinal: z.number(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ── Response Schemas ───────────────────────────────────────────────────

export const PeopleListWithCountSchema = PeopleListSchema.extend({
  profileCount: z.number(),
});

export const GetAllPeopleListsResponseSchema = z.array(PeopleListWithCountSchema);

export const CreatePeopleListResponseSchema = z.object({
  list: PeopleListSchema,
  insertedCount: z.number(),
});

export const GetPeopleListResponseSchema = z.object({
  list: PeopleListSchema,
  profiles: z.array(ProfileSchema),
  total: z.number(),
});

export const ProfileAddResponseSchema = z.object({
  profile: ProfileSchema,
});

export const ProfileRemoveResponseSchema = z.object({
  removed: z.literal(true),
});

export const ProfileOpResponseSchema = z.union([
  ProfileAddResponseSchema,
  ProfileRemoveResponseSchema,
]);

export const AddProfilesResponseSchema = z.object({
  insertedCount: z.number(),
  skippedCount: z.number(),
});

export const ValidateSignalsResponseSchema = z.object({
  totalProfiles: z.number(),
  processedProfiles: z.number(),
  enriched: z.number(),
  unchanged: z.number(),
  movementsDetected: z.number(),
  failed: z.number(),
});

// ── Type exports ───────────────────────────────────────────────────────

export type GetAllPeopleListsResponse = z.infer<typeof GetAllPeopleListsResponseSchema>;
export type CreatePeopleListResponse = z.infer<typeof CreatePeopleListResponseSchema>;
export type GetPeopleListResponse = z.infer<typeof GetPeopleListResponseSchema>;
export type ProfileOpResponse = z.infer<typeof ProfileOpResponseSchema>;
export type AddProfilesResponse = z.infer<typeof AddProfilesResponseSchema>;
export type ValidateSignalsResponse = z.infer<typeof ValidateSignalsResponseSchema>;

// ── Helpers ────────────────────────────────────────────────────────────

export function formatCadence(cadence: z.infer<typeof CadenceSchema>, interval: number = 1): string {
  if (cadence === "MANUAL") return "Manual";
  if (interval === 1) {
    return cadence.charAt(0) + cadence.slice(1).toLowerCase();
  }
  const unit = cadence === "DAILY" ? "day" : cadence === "WEEKLY" ? "week" : "month";
  return `Every ${interval} ${unit}${interval > 1 ? "s" : ""}`;
}
