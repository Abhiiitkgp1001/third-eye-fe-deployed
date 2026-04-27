import axios, { type AxiosInstance } from "axios";
import { auth } from "@clerk/nextjs/server";
import { getBackendBaseURL, getTRPCUrl } from "../config/backend";

/**
 * Get the backend base URL
 * @deprecated Use getBackendBaseURL from lib/config/backend instead
 */
export function getBackendUrl() {
  return getBackendBaseURL();
}

/**
 * Create an authenticated axios instance for backend API calls
 */
export async function getBackendAxios(): Promise<AxiosInstance> {
  const { getToken } = await auth();
  const token = await getToken();

  return axios.create({
    baseURL: getTRPCUrl(),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    timeout: 60*60*1000, // 1 hour - allows for large lists with hundreds of entities 
  });
}
