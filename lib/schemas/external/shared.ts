import { z } from "zod";

// Shared date schema used across profile and company data

export const DateDataSchema = z.object({
  month: z.coerce.number().nullish(),
  day: z.coerce.number().nullish(),
  year: z.coerce.number().nullish(),
  iso: z.coerce.date().nullish(),
});

export type DateData = z.infer<typeof DateDataSchema>;
