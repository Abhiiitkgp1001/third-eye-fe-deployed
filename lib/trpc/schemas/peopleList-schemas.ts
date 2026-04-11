import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────────

export const SyncStatusSchema = z.enum(["DRAFT", "BUILDING", "ENRICHING", "NORMAL", "FAILED"]);
export const CadenceSchema = z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]);
export const ProfileMovementSchema = z.enum(["PROFILE_ENRICHED", "PROFILE_NOT_FOUND", "ENRICHMENT_FAILED"]);

// ── PeopleList Schema ──────────────────────────────────────────────────

export const MovementDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

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
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  ordinal: z.number(),
});

export type PeopleList = z.infer<typeof PeopleListSchema>;

// ── Profile Metadata ───────────────────────────────────────────────────

export interface ProfileMetadataExperience {
  company_name?: string;
  company_logo_url?: string;
  date_range?: {
    start?: { iso: string };
    end?: { iso: string } | null;
  };
  positions?: {
    title?: string;
    employment_type?: string;
    description?: string;
  }[];
}

export interface ProfileMetadataEducation {
  school_name?: string;
  school_logo_url?: string;
  degree?: string;
  field_of_study?: string;
  grade?: string;
  date_range?: {
    start?: { year: number };
    end?: { year: number };
  };
}

export interface ProfileMetadata {
  first_name?: string;
  last_name?: string;
  headline?: string;
  summary?: string;
  profile_photo_url?: string;
  skills?: string[];
  experience?: ProfileMetadataExperience[];
  education?: ProfileMetadataEducation[];
  network_info?: {
    connections_count?: number;
    followers_count?: number;
  };
}

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

/** Type-safe accessor — latestMetadata is `unknown` from Zod; we trust the server shape. */
export function getProfileMetadata(profile: Profile): ProfileMetadata | null {
  return (profile.latestMetadata ?? null) as ProfileMetadata | null;
}

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

// ── Type exports ───────────────────────────────────────────────────────

export type GetAllPeopleListsResponse = z.infer<typeof GetAllPeopleListsResponseSchema>;
export type CreatePeopleListResponse = z.infer<typeof CreatePeopleListResponseSchema>;
export type GetPeopleListResponse = z.infer<typeof GetPeopleListResponseSchema>;
export type ProfileOpResponse = z.infer<typeof ProfileOpResponseSchema>;
export type AddProfilesResponse = z.infer<typeof AddProfilesResponseSchema>;

// ── Helpers ────────────────────────────────────────────────────────────

export function formatCadence(cadence: z.infer<typeof CadenceSchema>, interval: number = 1): string {
  if (cadence === "MANUAL") return "Manual";
  if (interval === 1) {
    return cadence.charAt(0) + cadence.slice(1).toLowerCase();
  }
  const unit = cadence === "DAILY" ? "day" : cadence === "WEEKLY" ? "week" : "month";
  return `Every ${interval} ${unit}${interval > 1 ? "s" : ""}`;
}
