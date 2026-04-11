import axios, { type AxiosInstance } from "axios";
import { auth } from "@clerk/nextjs/server";

/**
 * Get the backend base URL
 */
export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
}

/**
 * Create an authenticated axios instance for backend API calls
 */
export async function getBackendAxios(): Promise<AxiosInstance> {
  const { getToken } = await auth();
  const token = await getToken();

  return axios.create({
    baseURL: `${getBackendUrl()}/v1/trpc`,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    timeout: 120000, // 2 minutes - enrichment can be slow
  });
}
