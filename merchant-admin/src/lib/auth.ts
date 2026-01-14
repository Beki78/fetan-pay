// lib/auth.ts
// Better Auth server configuration
// This points to the server where Better Auth is running
// In production: https://api.fetanpay.et
// In development: http://localhost:3003
import { BASE_URL } from "@/lib/config";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: BASE_URL, // Points to the Better Auth server
  plugins: [],
});
