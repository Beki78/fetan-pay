import { createAuthClient } from "better-auth/react";

/**
 * Base URL for Better Auth endpoints.
 *
 * Our API base URL includes `/api/v1`, but Better Auth is mounted at the server root.
 * So we derive the origin by stripping `/api/v1` when present.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3003/api/v1";

const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
});
