import {
  customSessionClient,
  phoneNumberClient,
  adminClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { BASE_URL } from "@/lib/config";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [phoneNumberClient(), customSessionClient<typeof auth>(), adminClient()],
});

export const { signIn } = authClient;
