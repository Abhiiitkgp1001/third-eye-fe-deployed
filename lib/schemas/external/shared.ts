import { z } from "zod";

// Shared date schema used across profile and company data

export const DateDataSchema = z.object({
  month: z.coerce.number().nullish(),
  day: z.coerce.number().nullish(),
  year: z.coerce.number().nullish(),
  iso: z.coerce.date().nullish(),
});

export type DateData = z.infer<typeof DateDataSchema>;

// Shared post engagement schema used across profile and company data
export const PostWithEngagementSchema = z
  .object({
    activity: z.any().nullish(), // Post activity data (content, author, metadata)
    comments: z.any().nullish(), // Comments on the post
    reactions: z.any().nullish(), // Reactions on the post
  })
  .passthrough();

export type PostWithEngagement = z.infer<typeof PostWithEngagementSchema>;
