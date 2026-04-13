import type { DeploymentType } from "../util/env";

/**
 * Determines the current environment based on environment variables.
 * Priority: NEXT_PUBLIC_APP_ENV > VERCEL_ENV > NODE_ENV
 */
export const CURRENT_ENVIRONMENT: DeploymentType = (() => {
  // Allow explicit override via NEXT_PUBLIC_APP_ENV
  if (process.env.NEXT_PUBLIC_APP_ENV) {
    return process.env.NEXT_PUBLIC_APP_ENV as DeploymentType;
  }

  // Use Vercel's environment detection if available
  if (process.env.VERCEL_ENV === "production") {
    return "production";
  }

  // Fall back to NODE_ENV
  const nodeEnv = process.env.NODE_ENV || "development";
  return nodeEnv as DeploymentType;
})();

/**
 * Check if we're in development mode
 */
export const IS_DEVELOPMENT = CURRENT_ENVIRONMENT === "development";

/**
 * Check if we're in production mode
 */
export const IS_PRODUCTION = CURRENT_ENVIRONMENT === "production";

/**
 * Check if we're running on the client side
 */
export const IS_CLIENT = typeof window !== "undefined";

/**
 * Check if we're running on the server side
 */
export const IS_SERVER = !IS_CLIENT;
