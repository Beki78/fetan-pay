import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const BETTER_AUTH_BASE_URL = 'https://vps.afriuz.com';
const DEFAULT_SIGN_IN_REDIRECT = 'https://afriuz.com';
const DEFAULT_CLIENT_ORIGINS = [
  'https://afriuz.com',
  'https://admin.afriuz.com',
];
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'node';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'node';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    '[BetterAuth] Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
  );
} else {
  console.info('[BetterAuth] GOOGLE_CLIENT_ID loaded:', GOOGLE_CLIENT_ID);
}

console.info('[BetterAuth] Base URL set to:', BETTER_AUTH_BASE_URL);
console.info(
  '[BetterAuth] Default sign-in redirect URL:',
  DEFAULT_SIGN_IN_REDIRECT,
);

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'c0c11d5c7b1a0d2c944f4c0d7d0bfd6e5bf0a62829a0f33daf0183ad0f8855ec',
  logger: {
    disabled: false,
    level: 'debug',
  },
  baseURL: BETTER_AUTH_BASE_URL,
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'https://vps.afriuz.com',
    'https://afriuz.com',
    'https://admin.afriuz.com',
    'https://dev.vps.afriuz.com',
    'https://dev.client.afriuz.com',
    'https://dev.admin.afriuz.com',
    'https://api.afriuz.com',
    'https://unlavished-normand-forth.ngrok-free.dev',
    ...DEFAULT_CLIENT_ORIGINS,
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    useSecureCookies: false,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookie: {
      sameSite: 'lax',
      secure: false,
      httpOnly: true,
      domain: undefined,
      path: '/',
    },
    token: {
      enabled: true,
    },
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  callbacks: {
    signIn: {
      redirect: 'https://dev.client.afriuz.com',
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 40,
    autoSignIn: true,
  },
});
