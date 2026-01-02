import { BASE_URL } from "@/constant/baseApi";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: BASE_URL,
  plugins: [],
});
