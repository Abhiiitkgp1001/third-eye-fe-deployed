import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────────

export const SyncStatusSchema = z.enum(["DRAFT", "BUILDING", "ENRICHING", "NORMAL", "FAILED"]);
export const CadenceSchema = z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]);
export const ProfileMovementSchema = z.enum(["PROFILE_ENRICHED", "PROFILE_NOT_FOUND", "ENRICHMENT_FAILED"]);

// ── PeopleList Schema ──────────────────────────────────────────────────

export const PeopleListSchema = z.object({
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

export type PeopleList = z.infer<typeof PeopleListSchema>;

// ── Profile Schema ─────────────────────────────────────────────────────

export const ProfileSchema = z.object({
  id: z.string(),
  peopleListId: z.string(),
  linkedinUrl: z.string(),
  latestMetadata: z.unknown().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  ordinal: z.number(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ── Response Schemas ───────────────────────────────────────────────────

export const GetAllPeopleListsResponseSchema = z.array(PeopleListSchema);

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

// ── Type exports ───────────────────────────────────────────────────────

export type GetAllPeopleListsResponse = z.infer<typeof GetAllPeopleListsResponseSchema>;
export type CreatePeopleListResponse = z.infer<typeof CreatePeopleListResponseSchema>;
export type GetPeopleListResponse = z.infer<typeof GetPeopleListResponseSchema>;
export type ProfileOpResponse = z.infer<typeof ProfileOpResponseSchema>;
