import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins/email-otp';
import { admin } from 'better-auth/plugins/admin';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './src/modules/email/email.service';

const datasourceUrl = process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error('DATABASE_URL is not set for Prisma connection');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));

const prisma = new PrismaClient({ adapter });

const configService = new ConfigService();
const emailService = new EmailService(configService);

// const prisma = new PrismaClient({ adapter });

const BETTER_AUTH_BASE_URL =
  process.env.BETTER_AUTH_BASE_URL || process.env.AUTH_BASE_URL || 'http://localhost:3003';
const DEFAULT_CLIENT_ORIGINS = ['http://localhost:3000'];

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set for Google OAuth.');
}
type Auth = ReturnType<typeof betterAuth>;

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'c0c11d5c7b1a0d2c944f4c0d7d0bfd6e5bf0a62829a0f33daf0183ad0f8855ec',

  baseURL: BETTER_AUTH_BASE_URL,
  basePath: '/api/auth',

  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    ...DEFAULT_CLIENT_ORIGINS,
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true, // Enable for cross-port access
    },
    useSecureCookies: false, // Disable for localhost development
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookie: {
      sameSite: 'lax', // Use 'lax' for better compatibility
      secure: false, // Set to false for development (localhost)
      httpOnly: true, // Set to true for security
      domain: undefined, // Let the browser handle domain automatically
      path: '/', // Ensure cookie is available for all paths
    },
    // Enable session token support for Bearer token authentication
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
      redirect: 'http://localhost:3000',
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    autoSignIn: true,
  },
  plugins: [
    admin({
      defaultRole: 'EMPLOYEE',
      roles: {
        ADMIN: {
          authorize: () => ({ success: true }),
          statements: {},
        },
        MERCHANT_OWNER: {
          authorize: () => ({ success: true }),
          statements: {},
        },
        EMPLOYEE: {
          authorize: () => ({ success: true }),
          statements: {},
        },
        ACCOUNTANT: {
          authorize: () => ({ success: true }),
          statements: {},
        },
        SALES: {
          authorize: () => ({ success: true }),
          statements: {},
        },
        WAITER: {
          authorize: () => ({ success: true }),
          statements: {},
        },
      },
      adminRoles: ['ADMIN', 'MERCHANT_OWNER'],
    }),
    emailOTP({
      overrideDefaultEmailVerification: true,
      otpLength: 6,
      expiresIn: 5 * 60, // 5 minutes
      allowedAttempts: 3,
      async sendVerificationOTP({ email, otp, type }) {
        console.info('[auth] sendVerificationOTP -> sending', { email, type });
        await emailService.sendOtpEmail(email, otp, type);
      },
    }),
  ],
}) as Auth; // Use the locally defined Auth type
