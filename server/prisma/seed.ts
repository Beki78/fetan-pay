import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { hashPassword } from 'better-auth/crypto';

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
  throw new Error('DATABASE_URL is not set for Prisma connection');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME ?? 'Super Admin';

  if (!email || !password) {
    throw new Error(
      'Missing SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD env vars (required for seed).',
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
      role: 'SUPERADMIN',
      emailVerified: true,
    },
    create: {
      id: `seed_superadmin_${Date.now()}`,
      name,
      email,
      emailVerified: true,
      role: 'SUPERADMIN',
    },
  });

  const hashed = await hashPassword(password);

  const existingAccount = await prisma.account.findFirst({
    where: {
      providerId: 'credential',
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
        providerId: 'credential',
        accountId: email,
        password: hashed,
      },
    });
  }

  console.info('✅ Seeded SUPERADMIN', {
    userId: user.id,
    email,
    role: 'SUPERADMIN',
  });

  // Seed default payment providers (catalog shown in merchant-admin)
  const defaultProviders: Array<{
    code: 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';
    name: string;
    logoUrl?: string;
    status: 'ACTIVE' | 'COMING_SOON' | 'DISABLED';
  }> = [
    {
      code: 'CBE',
      name: 'Commercial Bank of Ethiopia',
      logoUrl: 'CBE.png',
      status: 'ACTIVE',
    },
    {
      code: 'TELEBIRR',
      name: 'Telebirr',
      logoUrl: 'Telebirr.png',
      status: 'ACTIVE',
    },
    {
      code: 'AWASH',
      name: 'Awash Bank',
      logoUrl: 'Awash.png',
      status: 'ACTIVE',
    },
    {
      code: 'BOA',
      name: 'Bank of Abyssinia',
      logoUrl: 'BOA.png',
      status: 'ACTIVE',
    },
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

  // Seed test merchant admin account and merchant
  const merchantAdminEmail =
    process.env.MERCHANT_ADMIN_EMAIL || 'merchantadmin@test.com';
  const merchantAdminPassword =
    process.env.MERCHANT_ADMIN_PASSWORD || 'merchantadmin123';
  const merchantAdminName = process.env.MERCHANT_ADMIN_NAME || 'Merchant Admin';

  // Create merchant admin user
  const merchantAdminUser = await prisma.user.upsert({
    where: { email: merchantAdminEmail },
    update: {
      name: merchantAdminName,
      emailVerified: true,
    },
    create: {
      id: `seed_merchant_admin_${Date.now()}`,
      name: merchantAdminName,
      email: merchantAdminEmail,
      emailVerified: true,
    },
  });

  const merchantAdminHashed = await hashPassword(merchantAdminPassword);

  const merchantAdminAccount = await prisma.account.findFirst({
    where: {
      providerId: 'credential',
      accountId: merchantAdminEmail,
    },
  });

  if (merchantAdminAccount) {
    await prisma.account.update({
      where: { id: merchantAdminAccount.id },
      data: {
        userId: merchantAdminUser.id,
        password: merchantAdminHashed,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        id: `seed_merchant_admin_cred_${merchantAdminUser.id}`,
        userId: merchantAdminUser.id,
        providerId: 'credential',
        accountId: merchantAdminEmail,
        password: merchantAdminHashed,
      },
    });
  }

  // Create test merchant
  const testMerchant = await (prisma as any).merchant.upsert({
    where: { id: 'seed_test_merchant' },
    update: {
      name: 'Test Merchant',
      contactEmail: merchantAdminEmail,
      contactPhone: '+251911000000',
      status: 'ACTIVE',
    },
    create: {
      id: 'seed_test_merchant',
      name: 'Test Merchant',
      contactEmail: merchantAdminEmail,
      contactPhone: '+251911000000',
      status: 'ACTIVE',
      source: 'seed',
      approvedAt: new Date(),
      approvedBy: user.id, // Approved by superadmin
    },
  });

  // Create merchant user (merchant admin) linked to the merchant
  const merchantUser = await (prisma as any).merchantUser.upsert({
    where: { id: 'seed_merchant_user_admin' },
    update: {
      merchantId: (testMerchant as { id: string }).id,
      userId: merchantAdminUser.id,
      role: 'MERCHANT_OWNER',
      status: 'ACTIVE',
      name: merchantAdminName,
      email: merchantAdminEmail,
    },
    create: {
      id: 'seed_merchant_user_admin',
      merchantId: (testMerchant as { id: string }).id,
      userId: merchantAdminUser.id,
      role: 'MERCHANT_OWNER',
      status: 'ACTIVE',
      name: merchantAdminName,
      email: merchantAdminEmail,
    },
  });

  console.info('✅ Seeded test merchant admin and merchant', {
    merchantAdminUserId: merchantAdminUser.id,
    merchantAdminEmail,
    merchantAdminPassword: merchantAdminPassword, // Show password for testing
    merchantId: (testMerchant as { id: string; name: string }).id,
    merchantName: (testMerchant as { id: string; name: string }).name,
    merchantUserId: (merchantUser as { id: string }).id,
  });

  console.info('📝 Merchant Admin Login Credentials:', {
    email: merchantAdminEmail,
    password: merchantAdminPassword,
    role: 'MERCHANT_OWNER',
  });

  // Seed waiter/sales user for merchant app
  const waiterEmail = process.env.WAITER_EMAIL || 'waiter@test.com';
  const waiterPassword = process.env.WAITER_PASSWORD || 'waiter123';
  const waiterName = process.env.WAITER_NAME || 'Test Waiter';
  const waiterRole = (process.env.WAITER_ROLE || 'WAITER') as
    | 'WAITER'
    | 'SALES';

  // Create waiter/sales user
  const waiterUser = await prisma.user.upsert({
    where: { email: waiterEmail },
    update: {
      name: waiterName,
      emailVerified: true,
    },
    create: {
      id: `seed_waiter_${Date.now()}`,
      name: waiterName,
      email: waiterEmail,
      emailVerified: true,
    },
  });

  const waiterHashed = await hashPassword(waiterPassword);

  const waiterAccount = await prisma.account.findFirst({
    where: {
      providerId: 'credential',
      accountId: waiterEmail,
    },
  });

  if (waiterAccount) {
    await prisma.account.update({
      where: { id: waiterAccount.id },
      data: {
        userId: waiterUser.id,
        password: waiterHashed,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        id: `seed_waiter_cred_${waiterUser.id}`,
        userId: waiterUser.id,
        providerId: 'credential',
        accountId: waiterEmail,
        password: waiterHashed,
      },
    });
  }

  // Create merchant user (waiter/sales) linked to the merchant
  const waiterMerchantUser = await (prisma as any).merchantUser.upsert({
    where: { id: 'seed_merchant_user_waiter' },
    update: {
      merchantId: (testMerchant as { id: string }).id,
      userId: waiterUser.id,
      role: waiterRole,
      status: 'ACTIVE',
      name: waiterName,
      email: waiterEmail,
    },
    create: {
      id: 'seed_merchant_user_waiter',
      merchantId: (testMerchant as { id: string }).id,
      userId: waiterUser.id,
      role: waiterRole,
      status: 'ACTIVE',
      name: waiterName,
      email: waiterEmail,
    },
  });

  console.info('✅ Seeded waiter/sales user for merchant app', {
    waiterUserId: waiterUser.id,
    waiterEmail,
    waiterRole,
    merchantId: (testMerchant as { id: string }).id,
    merchantUserId: (waiterMerchantUser as { id: string }).id,
  });

  console.info('📝 Merchant App Login Credentials (Waiter/Sales):', {
    email: waiterEmail,
    password: waiterPassword,
    role: waiterRole,
    app: 'Merchant App (Mobile)',
  });

  // Seed merchant receiver accounts (CBE and Awash)
  const merchantReceiverAccounts = [
    {
      id: 'seed_receiver_cbe',
      merchantId: (testMerchant as { id: string }).id,
      provider: 'CBE',
      receiverAccount: '1000532348645',
      receiverName: 'Bereket Getachew',
      status: 'ACTIVE',
    },
    {
      id: 'seed_receiver_awash',
      merchantId: (testMerchant as { id: string }).id,
      provider: 'AWASH',
      receiverAccount: '013201175173801',
      receiverName: 'Bereket Getachew',
      status: 'ACTIVE',
    },
  ];

  for (const account of merchantReceiverAccounts) {
    await (prisma as any).merchantReceiverAccount.upsert({
      where: { id: account.id },
      update: {
        receiverAccount: account.receiverAccount,
        receiverName: account.receiverName,
        status: account.status,
      },
      create: account,
    });
  }

  console.info('✅ Seeded merchant receiver accounts', {
    merchantId: (testMerchant as { id: string }).id,
    accounts: merchantReceiverAccounts.map((a) => ({
      provider: a.provider,
      receiverAccount: a.receiverAccount,
      status: a.status,
    })),
  });

  // Seed wallet deposit receiver accounts for testing
  console.info('🌱 Seeding wallet deposit receiver accounts...');

  const walletDepositReceivers = [
    {
      provider: 'CBE' as const,
      receiverAccount: '1000675169601',
      receiverName: 'FetanPay Wallet Deposits - CBE',
      receiverLabel: 'CBE Test Account',
      status: 'ACTIVE',
    },
    {
      provider: 'AWASH' as const,
      receiverAccount: '0131234567890',
      receiverName: 'FetanPay Wallet Deposits - Awash',
      receiverLabel: 'Awash Test Account',
      status: 'ACTIVE',
    },
    {
      provider: 'BOA' as const,
      receiverAccount: '1234567890123',
      receiverName: 'FetanPay Wallet Deposits - BOA',
      receiverLabel: 'BOA Test Account',
      status: 'ACTIVE',
    },
    {
      provider: 'TELEBIRR' as const,
      receiverAccount: '0912345678',
      receiverName: 'FetanPay Wallet Deposits - Telebirr',
      receiverLabel: 'Telebirr Test Account',
      status: 'ACTIVE',
    },
    {
      provider: 'DASHEN' as const,
      receiverAccount: '1234567890123',
      receiverName: 'FetanPay Wallet Deposits - Dashen',
      receiverLabel: 'Dashen Test Account',
      status: 'ACTIVE',
    },
  ];

  for (const receiver of walletDepositReceivers) {
    try {
      await (prisma as any).walletDepositReceiverAccount.upsert({
        where: {
          wallet_deposit_receiver_unique: {
            provider: receiver.provider,
            receiverAccount: receiver.receiverAccount,
          },
        },
        update: {
          receiverName: receiver.receiverName,
          receiverLabel: receiver.receiverLabel,
          status: receiver.status,
        },
        create: {
          provider: receiver.provider,
          receiverAccount: receiver.receiverAccount,
          receiverName: receiver.receiverName,
          receiverLabel: receiver.receiverLabel,
          status: receiver.status,
        },
      });
      console.info(
        `✅ Created/updated ${receiver.provider} wallet deposit receiver: ${receiver.receiverAccount}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to seed ${receiver.provider} wallet receiver:`,
        error,
      );
    }
  }

  console.info('✅ Wallet deposit receiver accounts seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
