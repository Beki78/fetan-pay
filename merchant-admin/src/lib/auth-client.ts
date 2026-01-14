import {
  customSessionClient,
  phoneNumberClient,
  adminClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { BASE_URL } from "@/lib/config";

// Better Auth client configuration
// This client points to the Better Auth server configured in BASE_URL
// In production: https://api.fetanpay.et/api/auth
// In development: http://localhost:3003/api/auth
export const authClient = createAuthClient({
  /** The base URL of the Better Auth server */
  baseURL: BASE_URL, // Points to api.fetanpay.et (production) or localhost:3003 (development)
  fetchOptions: {
    credentials: "include", // Ensure cookies are sent with requests
    // Remove custom Authorization header - let Better Auth handle it
  },
  plugins: [
    phoneNumberClient(),
    customSessionClient<typeof auth>(),
    adminClient(),
  ],
});
export const { signIn } = authClient;
