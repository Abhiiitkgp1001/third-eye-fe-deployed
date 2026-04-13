import { type ZodSchema, type z } from "zod";

/**
 * Safe wrapper around Zod schema parsing that suppresses sensitive schema names in errors.
 * In production, returns generic error messages. In development, shows full Zod errors.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Context string for logging (e.g., "profile metadata", "company data")
 * @returns Validated data or throws sanitized error
 */
export function safeParseSchema<T extends ZodSchema>(
  schema: T,
  data: unknown,
  context: string = "data"
): z.infer<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  // In development, log full error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(`[Validation Error] ${context}:`, result.error.format());
  }

  // In production, throw generic error that doesn't leak schema names or structure
  throw new Error(`Invalid ${context} format`);
}

/**
 * Safe wrapper that returns null instead of throwing on validation failure.
 * Logs errors in development, silent in production.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Context string for logging
 * @returns Validated data or null on failure
 */
export function safeParseOrNull<T extends ZodSchema>(
  schema: T,
  data: unknown,
  context: string = "data"
): z.infer<T> | null {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  // In development, log full error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(`[Validation Error] ${context}:`, result.error.format());
  }

  return null;
}
