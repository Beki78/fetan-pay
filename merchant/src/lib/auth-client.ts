import { createAuthClient } from "better-auth/react";
import { BASE_URL } from "./config";

/**
 * Better Auth client configuration
 * This client points to the Better Auth server configured in BASE_URL
 * In production: https://api.fetanpay.et/api/auth
 * In development: http://localhost:3003/api/auth
 */
export const authClient = createAuthClient({
  baseURL: BASE_URL, // Points to api.fetanpay.et (production) or localhost:3003 (development)
  fetchOptions: {
    credentials: "include",
  },
});
