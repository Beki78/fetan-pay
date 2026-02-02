import 'dotenv/config';
import { PrismaClient, SubscriptionStatus, BillingCycle } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  throw new Error('DATABASE_URL is not set for Prisma connection');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));
const prisma = new PrismaClient({ adapter });

async function createTestSubscriptions() {
  console.log('Creating test subscriptions for expiry notifications...');

  try {
    // Find an active merchant
    const merchant = await prisma.merchant.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        users: true,
      },
    });

    if (!merchant) {
      console.log('No active merchant found. Please create a merchant first.');
      return;
    }

    // Find a paid plan
    const plan = await prisma.plan.findFirst({
      where: {
        status: 'ACTIVE',
        price: { gt: 0 },
      },
    });

    if (!plan) {
      console.log('No paid plan found. Please create a paid plan first.');
      return;
    }

    // Create a subscription expiring in 2 days
    const expiringIn2Days = new Date();
    expiringIn2Days.setDate(expiringIn2Days.getDate() + 2);
    expiringIn2Days.setHours(23, 59, 59, 999);

    const expiringSubscription = await prisma.subscription.create({
      data: {
        merchantId: merchant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: expiringIn2Days,
        nextBillingDate: expiringIn2Days,
        monthlyPrice: plan.price,
        billingCycle: BillingCycle.MONTHLY,
      },
    });

    console.log(
      `✅ Created subscription expiring in 2 days: ${expiringSubscription.id}`,
    );

    // Create a subscription that expired yesterday
    const expiredYesterday = new Date();
    expiredYesterday.setDate(expiredYesterday.getDate() - 1);
    expiredYesterday.setHours(23, 59, 59, 999);

    const expiredSubscription = await prisma.subscription.create({
      data: {
        merchantId: merchant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE, // Still active but should be expired
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: expiredYesterday,
        nextBillingDate: expiredYesterday,
        monthlyPrice: plan.price,
        billingCycle: BillingCycle.MONTHLY,
      },
    });

    console.log(`✅ Created expired subscription: ${expiredSubscription.id}`);

    console.log('\nTest subscriptions created successfully!');
    console.log(
      'You can now test the expiry notifications by calling the manual endpoints:',
    );
    console.log('- POST /pricing/test/check-expiring-subscriptions');
    console.log('- POST /pricing/test/check-expired-subscriptions');
  } catch (error) {
    console.error('Error creating test subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSubscriptions();
