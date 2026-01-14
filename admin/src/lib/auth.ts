import { BASE_URL } from "@/lib/config";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: BASE_URL,
  plugins: [],
});
