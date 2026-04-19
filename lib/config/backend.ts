import { match } from "ts-pattern";
import { CURRENT_ENVIRONMENT } from "./dev";

/**
 * Backend URL configuration for different environments
 */
export const BACKEND_URLS = {
  PRODUCTION: "https://vigil.thirrdeye.com/",
  LOCAL: "http://localhost:8000",
} as const;

/**
 * Helper function to get the base URL for the backend according to the current environment.
 * @returns The backend base URL
 */
function getBackendBaseUrl(): string {
  // For now, always use Railway production backend
  // TODO: Add environment-based logic when we deploy frontend to production
  return BACKEND_URLS.LOCAL;

  // Commented out: environment-based logic
  // const backendBase: string = match(CURRENT_ENVIRONMENT)
  //   .with("production", () => BACKEND_URLS.PRODUCTION)
  //   .with("development", () => BACKEND_URLS.LOCAL)
  //   .exhaustive();
  // return backendBase;
}

/**
 * Computes the appropriate URL for hitting the backend API.
 * Decides whether to use production or local backend based on environment.
 *
 * @param endpoint The relative URL of the endpoint you want to hit, like `/v1/trpc`
 * @returns The complete, absolute URL of the endpoint
 */
export function createBackendURL(endpoint: string): string {
  const backendBase: string = getBackendBaseUrl();
  const url = new URL(endpoint, backendBase);
  return url.href;
}

/**
 * Get the base URL for the backend (without any path)
 * @returns The backend base URL
 */
export function getBackendBaseURL(): string {
  return getBackendBaseUrl();
}

/**
 * This is a helper function to convert an HTTP URL to a WebSocket URL.
 * https -> wss
 * http -> ws
 * @param url The HTTP/HTTPS URL to convert
 * @returns The WebSocket URL
 */
function httpToWs(url: string): string {
  return url.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://");
}

/**
 * This function returns the base URL for the backend WebSocket connections.
 * @returns The WebSocket base URL
 */
export function getBackendSocketBaseURL(): string {
  const backendBase: string = getBackendBaseUrl();
  return httpToWs(backendBase);
}

/**
 * Get the full tRPC URL for the backend
 * @returns The tRPC endpoint URL
 */
export function getTRPCUrl(): string {
  return createBackendURL("/v1/trpc");
}
