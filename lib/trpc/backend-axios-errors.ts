import { isAxiosError } from "axios";

/**
 * Common error envelope returned by the shiv tRPC HTTP adapter on failed requests.
 * Use with `backendErrorFromAxios` when handling axios errors from the backend client.
 */
export type BackendErrorShape = {
  error?: { code?: string; message?: string };
};

/**
 * If `error` is an axios error with a JSON body, returns the parsed backend error shape.
 */
export function backendErrorFromAxios(
  error: unknown
): BackendErrorShape | undefined {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data;
  if (!data || typeof data !== "object") return undefined;
  return data as BackendErrorShape;
}

/**
 * Safe string for logging or TRPCError messages when `catch` uses `unknown`.
 */
export function messageFromUnknown(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

/** Re-export for call sites that only need this module (optional). */
export { isAxiosError } from "axios";
