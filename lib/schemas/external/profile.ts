import { z } from "zod";
import { DateDataSchema } from "./shared";

// Profile data schema with passthrough enabled to preserve unknown fields
// Zod coercion applied on numeric/date fields to handle type inconsistencies

export const EmployeeRangeSchema = z.object({
  start: z.coerce.number().nullish(),
  end: z.coerce.number().nullish(),
});

export const StartEndDateSchema = z.object({
  start: DateDataSchema.nullish(),
  end: DateDataSchema.nullish(),
});

export const LocationSchema = z.object({
  name: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  country_code: z.string().nullish(),
});

export const PositionCommonSchema = z.object({
  company_name: z.string().nullish(),
  company_id: z.string().nullish(),
  company_url: z.string().nullish(),
  company_logo_url: z.string().nullish(),
  company_employee_count_range: EmployeeRangeSchema.nullish(),
  company_industry: z.string().nullish(),
  location_name: z.string().nullish(),
  date_range: StartEndDateSchema.nullish(),
});

export const PositionSchema = PositionCommonSchema.extend({
  title: z.string().nullish(),
  description: z.string().nullish(),
  employment_type: z.string().nullish(),
  has_skill_associations: z.boolean().nullish(),
});

export const ExperienceSchema = PositionCommonSchema.extend({
  positions: z.array(PositionSchema).nullish(),
});

export const EducationSchema = z.object({
  school_id: z.string().nullish(),
  school_name: z.string().nullish(),
  school_url: z.string().nullish(),
  school_logo_url: z.string().nullish(),
  degree: z.string().nullish(),
  field_of_study: z.string().nullish(),
  description: z.string().nullish(),
  activities: z.string().nullish(),
  grade: z.string().nullish(),
  date_range: StartEndDateSchema.nullish(),
});

export const CompanyRefSchema = z.object({
  company_id: z.string().nullish(),
  name: z.string().nullish(),
  url: z.string().nullish(),
  logo_url: z.string().nullish(),
  employee_count_range: EmployeeRangeSchema.nullish(),
  industry: z.array(z.string()).nullish(),
});

export const ActivityCommonSchema = z.object({
  name: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  date_range: StartEndDateSchema.nullish(),
  url: z.string().nullish(),
  company: CompanyRefSchema.nullish(),
  company_id: z.string().nullish(),
  image_url: z.string().nullish(),
  position_held: z.string().nullish(),
});

export const ContributorSchema = z.object({
  standardizedContributor: z.object({
    profile: z.object({
      firstName: z.string().nullish(),
      lastName: z.string().nullish(),
      memorialized: z.boolean().nullish(),
      profilePicture: z.object({ a11yText: z.string().nullish() }).nullish(),
      headline: z.string().nullish(),
      publicIdentifier: z.string().nullish(),
    }).nullish(),
  }).nullish(),
});

export const NetworkSchema = z.object({
  followers_count: z.coerce.number().nullish(),
  connections_count: z.coerce.number().nullish(),
});

export const BadgeSchema = z.object({
  premium: z.boolean().nullish(),
  influencer: z.boolean().nullish(),
  top_voice: z.boolean().nullish(),
  open_to_work: z.boolean().nullish(),
  is_hiring: z.boolean().nullish(),
});

export const VerificationSchema = z.object({
  is_verified: z.boolean().nullish(),
  joined_date: z.string().nullish(),
});

export const ContactInfoSchema = z.object({
  email_address: z.string().nullish(),
  websites: z.array(z.object({ url: z.string().nullish(), type: z.string().nullish(), label: z.string().nullish() })).nullish(),
  twitter_handles: z.array(z.string()).nullish(),
  phone_numbers: z.array(z.object({ number: z.string().nullish(), type: z.string().nullish() })).nullish(),
  birth_date: DateDataSchema.nullish(),
  address: z.string().nullish(),
});

export const ProfileDataSchema = z
  .object({
    member_urn: z.string(),
    entity_urn: z.string(),
    public_identifier: z.string(),
    first_name: z.string().nullish(),
    last_name: z.string().nullish(),
    headline: z.string().nullish(),
    summary: z.string().nullish(),
    industry: z.string().nullish(),
    location: LocationSchema.nullish(),
    network_info: NetworkSchema.nullish(),
    profile_photo_url: z.string().nullish(),
    background_photo_url: z.string().nullish(),
    websites: z.array(z.string()).nullish(),
    profile_url: z.string().nullish(),
    experience: z.array(ExperienceSchema).nullish(),
    education: z.array(EducationSchema).nullish(),
    projects: z.array(ActivityCommonSchema.extend({ contributorsResolutionResults: z.array(ContributorSchema).nullish() })).nullish(),
    patents: z.array(ActivityCommonSchema.extend({ pending: z.boolean().nullish(), patentNumber: z.string().nullish(), issuer: z.string().nullish(), inventorsResolutionResults: z.array(ContributorSchema).nullish() })).nullish(),
    publications: z.array(ActivityCommonSchema.extend({ publishedOn: DateDataSchema.nullish(), publisher: z.string().nullish(), authorsResolutionResults: z.array(ContributorSchema).nullish() })).nullish(),
    honors: z.array(ActivityCommonSchema.extend({ issuer: z.string().nullish(), issuedOn: DateDataSchema.nullish() })).nullish(),
    certifications: z.array(ActivityCommonSchema.extend({ authority: z.string().nullish() })).nullish(),
    skills: z.array(z.string()).nullish(),
    organizations: z.array(ActivityCommonSchema).nullish(),
    volunteer_experiences: z.array(ActivityCommonSchema.extend({ role: z.string().nullish(), companyName: z.string().nullish(), cause: z.string().nullish() })).nullish(),
    languages: z.array(ActivityCommonSchema.extend({ proficiency: z.string().nullish() })).nullish(),
    courses: z.array(ActivityCommonSchema).nullish(),
    test_scores: z.array(ActivityCommonSchema.extend({ score: z.string().nullish(), dateOn: DateDataSchema.nullish() })).nullish(),
    badges: BadgeSchema.nullish(),
    verifications: VerificationSchema.nullish(),
    contact_info: ContactInfoSchema.nullish(),
  })
  .passthrough();

export type ProfileData = z.infer<typeof ProfileDataSchema>;

// Post with engagement data (from Activities API)
export const PostWithEngagementSchema = z
  .object({
    activity: z.any().nullish(), // Post activity data (content, author, metadata)
    comments: z.any().nullish(), // Comments on the post
    reactions: z.any().nullish(), // Reactions on the post
  })
  .passthrough();

export type PostWithEngagement = z.infer<typeof PostWithEngagementSchema>;

// Aggregated data schema (profile + posts)
// This is the new format stored in latestMetadata after backend changes
export const PeopleAggregatedDataSchema = z
  .object({
    profile: ProfileDataSchema.nullish(),
    posts: z.array(PostWithEngagementSchema).nullish(),
  })
  .passthrough();

export type PeopleAggregatedData = z.infer<typeof PeopleAggregatedDataSchema>;

// Union schema for backward compatibility
// Handles both old format (just ProfileData) and new format (PeopleAggregatedData)
export const ProfileMetadataSchema = z.union([
  ProfileDataSchema,          // Old format: direct profile data
  PeopleAggregatedDataSchema, // New format: { profile, posts }
]);

export type ProfileMetadata = z.infer<typeof ProfileMetadataSchema>;
