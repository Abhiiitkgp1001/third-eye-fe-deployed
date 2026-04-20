import { z } from "zod";
import { DateDataSchema } from "./shared";

// Company data schema with passthrough enabled to preserve unknown fields
// Zod coercion applied on numeric/date fields to handle type inconsistencies

export const CompanyTypeSchema = z.object({
  type_code: z.string().nullish(),
  type_name: z.string().nullish(),
});

export const StaffRangeSchema = z.object({
  start: z.coerce.number().nullish(),
  end: z.coerce.number().nullish(),
});

export const StaffInfoSchema = z.object({
  staff_count: z.coerce.number().nullish(),
  staff_range: StaffRangeSchema.nullish(),
});

export const CompanyLocationSchema = z.object({
  country: z.string().nullish(),
  geographic_area: z.string().nullish(),
  city: z.string().nullish(),
  postal_code: z.string().nullish(),
  is_headquarter: z.boolean().nullish(),
  address_line1: z.string().nullish(),
});

export const CompanyLocationsSchema = z.object({
  headquarter: CompanyLocationSchema.nullish(),
  all_locations: z.array(CompanyLocationSchema).nullish(),
});

export const MoneyRaisedSchema = z.object({
  currency: z.string().nullable(),
  amount: z.coerce.number().nullable(),
});

export const LeadInvestorSchema = z.object({
  name: z.string().nullable(),
  logo: z.string().nullable(),
  investor_url: z.string().nullable(),
});

export const LastFundingRoundSchema = z.object({
  funding_type: z.string().nullish(),
  money_raised: MoneyRaisedSchema.nullish(),
  announced_on: DateDataSchema.nullish(),
  round_url: z.string().nullish(),
  num_of_other_investors: z.coerce.number().nullish(),
  lead_investors: z.array(LeadInvestorSchema).nullish(),
});

export const FundingDataSchema = z.object({
  num_of_funding_rounds: z.coerce.number().nullish(),
  last_funding_round: LastFundingRoundSchema.nullish(),
  company_crunchbase_url: z.string().nullish(),
  rounds_crunchbase_url: z.string().nullish(),
});

export const IndustrySchema = z.object({
  id: z.string().nullish(),
  name: z.string().nullish(),
});

export const CallToActionSchema = z.object({
  url: z.string().nullable(),
  text: z.string().nullable(),
});

export const RelatedEntitySchema = z.object({
  entity_urn: z.string().nullish(),
  public_identifier: z.string().nullish(),
  company_name: z.string().nullish(),
  description: z.string().nullish(),
  company_url: z.string().nullish(),
  logo_url: z.string().nullish(),
  industries: z.array(IndustrySchema).nullish(),
  is_paid: z.boolean().nullish(),
  followers_count: z.coerce.number().nullish(),
  is_showcase: z.boolean().nullish(),
});

export const CompanyDataSchema = z
  .object({
    company_id: z.string(),
    public_identifier: z.string(),
    company_name: z.string().nullish(),
    tagline: z.string().nullish(),
    description: z.string().nullish(),
    company_type: CompanyTypeSchema.nullish(),
    locations: CompanyLocationsSchema.nullish(),
    specialities: z.array(z.string()).nullish(),
    platform_url: z.string().nullish(),
    auto_generated: z.boolean().nullish(),
    followers_count: z.coerce.number().nullish(),
    phone_number: z.string().nullish(),
    industries: z.array(IndustrySchema).nullish(),
    claimable: z.boolean().nullish(),
    founded_on: DateDataSchema.nullish(),
    is_showcase: z.boolean().nullish(),
    is_paid: z.boolean().nullish(),
    logo_url: z.string().nullish(),
    background_photo_url: z.string().nullish(),
    call_to_action: CallToActionSchema.nullish(),
    company_url: z.string().nullish(),
    staff_info: StaffInfoSchema.nullish(),
    funding_data: FundingDataSchema.nullish(),
    showcase_pages: z.array(RelatedEntitySchema).nullish(),
    affiliated_companies: z.array(RelatedEntitySchema).nullish(),
    cover_image_url: z.string().nullish(),
  })
  .passthrough();

export type CompanyData = z.infer<typeof CompanyDataSchema>;

// Post with engagement data (from Activities API)
export const PostWithEngagementSchema = z
  .object({
    activity: z.any().nullish(), // Post activity data (content, author, metadata)
    comments: z.any().nullish(), // Comments on the post
    reactions: z.any().nullish(), // Reactions on the post
  })
  .passthrough();

export type PostWithEngagement = z.infer<typeof PostWithEngagementSchema>;

// Aggregated data schema (company + posts)
// This is the new format stored in latestMetadata after backend changes
export const CompanyAggregatedDataSchema = z
  .object({
    company: CompanyDataSchema.nullish(),
    company_posts: z.array(PostWithEngagementSchema).nullish(),
  })
  .passthrough();

export type CompanyAggregatedData = z.infer<typeof CompanyAggregatedDataSchema>;

// Union schema for backward compatibility
// Handles both old format (just CompanyData) and new format (CompanyAggregatedData)
export const CompanyMetadataSchema = z.union([
  CompanyDataSchema,             // Old format: direct company data
  CompanyAggregatedDataSchema,   // New format: { company, company_posts }
]);

export type CompanyMetadata = z.infer<typeof CompanyMetadataSchema>;
