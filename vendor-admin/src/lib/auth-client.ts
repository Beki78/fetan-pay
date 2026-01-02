import {
  customSessionClient,
  phoneNumberClient,
  adminClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { BASE_URL } from "@/constant/baseApi";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: BASE_URL,
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
