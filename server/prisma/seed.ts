import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";

/**
 * Seed strategy for Better Auth + admin plugin:
 * - Create (or upsert) a "superadmin" auth user in the Better Auth `User` table.
 * - Set `role` = "SUPERADMIN" so the admin plugin treats this user as an admin.
 * - Create an email/password credential in the `Account` table (providerId="credential").
 *
 * This matches the common Better Auth Prisma adapter layout.
 *
 * Env vars:
 * - SUPERADMIN_EMAIL (required)
 * - SUPERADMIN_PASSWORD (required)
 * - SUPERADMIN_NAME (optional)
 */

const datasourceUrl = process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error("DATABASE_URL is not set for Prisma connection");
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME ?? "Super Admin";

  if (!email || !password) {
    throw new Error(
      "Missing SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD env vars (required for seed)."
    );
  }

  // IMPORTANT: Better Auth does NOT store plaintext passwords.
  // If you write directly into Account.password you must follow Better Auth's internal
  // hash format; otherwise sign-in throws "Invalid password hash".
  //
  // So we let Better Auth handle password hashing by using its admin API.
  // - If the user doesn't exist: create them.
  // - Always set the password via `setUserPassword` (hashed internally).

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "SUPERADMIN",
      emailVerified: true,
    },
    create: {
      id: `seed_superadmin_${Date.now()}`,
      name,
      email,
      emailVerified: true,
      role: "SUPERADMIN",
    },
  });

  const hashed = await hashPassword(password);

  const existingAccount = await prisma.account.findFirst({
    where: {
      providerId: "credential",
      accountId: email,
    },
    select: { id: true },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        userId: user.id,
        password: hashed,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        id: `seed_cred_${user.id}`,
        userId: user.id,
        providerId: "credential",
        accountId: email,
        password: hashed,
      },
    });
  }

  console.info("✅ Seeded SUPERADMIN", {
    userId: user.id,
    email,
    role: "SUPERADMIN",
  });

  // Seed default payment providers (catalog shown in merchant-admin)
  const defaultProviders: Array<{
    code: 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';
    name: string;
    logoUrl?: string;
    status: 'ACTIVE' | 'COMING_SOON' | 'DISABLED';
  }> = [
    { code: 'CBE', name: 'Commercial Bank of Ethiopia', logoUrl: 'CBE.png', status: 'ACTIVE' },
    { code: 'TELEBIRR', name: 'Telebirr', logoUrl: 'Telebirr.png', status: 'ACTIVE' },
    { code: 'AWASH', name: 'Awash Bank', logoUrl: 'Awash.png', status: 'ACTIVE' },
    { code: 'BOA', name: 'Bank of Abyssinia', logoUrl: 'BOA.png', status: 'ACTIVE' },
    { code: 'DASHEN', name: 'Dashen Bank', status: 'COMING_SOON' },
  ];

  for (const p of defaultProviders) {
    await (prisma as any).paymentProvider.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        logoUrl: p.logoUrl,
        status: p.status,
      },
      create: {
        // Keep ids deterministic for seed (use code)
        id: `seed_provider_${p.code}`,
        code: p.code,
        name: p.name,
        logoUrl: p.logoUrl,
        status: p.status,
      },
    });
  }

  console.info('✅ Seeded payment provider catalog', {
    count: defaultProviders.length,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
