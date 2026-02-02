import 'dotenv/config';
import { PrismaClient, BillingCycle } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  throw new Error('DATABASE_URL is not set for Prisma connection');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));
const prisma = new PrismaClient({ adapter });

async function fixSubscriptionExpiration() {
  console.log('🔧 Fixing subscription expiration dates...');

  try {
    // Get all active subscriptions without endDate
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ endDate: null }, { endDate: undefined }],
      },
      include: {
        plan: true,
        merchant: true,
      },
    });

    console.log(`Found ${subscriptions.length} subscriptions to update`);

    for (const subscription of subscriptions) {
      let endDate: Date | null = null;
      let nextBillingDate: Date | null = null;

      // For Free plans, set 7-day trial from merchant creation
      if (subscription.plan.name === 'Free') {
        const trialStartDate = subscription.merchant.createdAt;
        endDate = new Date(trialStartDate);
        endDate.setDate(endDate.getDate() + 7);

        console.log(
          `Setting Free plan trial for merchant ${subscription.merchantId}: expires ${endDate.toISOString()}`,
        );
      }
      // For paid plans, set expiration based on billing cycle
      else if (Number(subscription.plan.price) > 0) {
        const startDate = new Date(subscription.startDate);
        endDate = new Date(startDate);
        nextBillingDate = new Date(startDate);

        switch (subscription.plan.billingCycle) {
          case BillingCycle.MONTHLY:
            endDate.setMonth(endDate.getMonth() + 1);
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            break;
          case BillingCycle.YEARLY:
            endDate.setFullYear(endDate.getFullYear() + 1);
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            break;
          case BillingCycle.WEEKLY:
            endDate.setDate(endDate.getDate() + 7);
            nextBillingDate.setDate(nextBillingDate.getDate() + 7);
            break;
          case BillingCycle.DAILY:
            endDate.setDate(endDate.getDate() + 1);
            nextBillingDate.setDate(nextBillingDate.getDate() + 1);
            break;
        }

        console.log(
          `Setting ${subscription.plan.name} plan expiration for merchant ${subscription.merchantId}: expires ${endDate.toISOString()}, next billing ${nextBillingDate.toISOString()}`,
        );
      }

      // Update the subscription
      if (endDate) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            endDate,
            nextBillingDate,
            updatedAt: new Date(),
          },
        });
      }
    }

    console.log('✅ Successfully updated subscription expiration dates');
  } catch (error) {
    console.error('❌ Error fixing subscription expiration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixSubscriptionExpiration()
  .then(() => {
    console.log('🎉 Subscription expiration fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to fix subscription expiration:', error);
    process.exit(1);
  });
