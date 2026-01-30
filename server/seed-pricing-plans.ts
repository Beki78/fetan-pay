import 'dotenv/config';
import { PrismaClient, PlanStatus, BillingCycle } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  throw new Error('DATABASE_URL is not set for Prisma connection');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));
const prisma = new PrismaClient({ adapter });

async function seedPricingPlans() {
  console.log('🌱 Seeding pricing plans...');

  // Create default pricing plans
  const plans = [
    {
      name: 'Free',
      description:
        'Perfect for testing the platform and small businesses getting started',
      price: 0,
      billingCycle: BillingCycle.MONTHLY,
      limits: {
        verifications_monthly: 100,
        api_keys: 2,
        team_members: 2,
        webhooks: 1,
        bank_accounts: 2,
        payment_providers: 2,
        custom_branding: false,
        advanced_analytics: false,
        export_functionality: false,
        transaction_history_days: 30,
        api_rate_per_minute: 60,
      },
      features: [
        '100 verifications/month',
        'Full API access',
        '2 API keys',
        'Vendor dashboard',
        'Basic analytics',
        'All verification methods',
        'Multi-bank support',
        'Frontend UI (with watermark)',
        'Bank account management (up to 2 accounts)',
        'Transaction history (30 days)',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: false,
      displayOrder: 1,
    },
    {
      name: 'Starter',
      description: 'Perfect for small businesses and startups',
      price: 1740, // $29 * 60 ETB
      billingCycle: BillingCycle.MONTHLY,
      limits: {
        verifications_monthly: 1000,
        api_keys: 2,
        team_members: 5,
        webhooks: 3,
        bank_accounts: 5,
        payment_providers: 3,
        custom_branding: false,
        advanced_analytics: true,
        export_functionality: false,
        transaction_history_days: 180,
        api_rate_per_minute: 60,
      },
      features: [
        '1,000 verifications/month',
        'Full API access',
        '2 API keys',
        'Vendor dashboard',
        'Webhook support',
        'Advanced analytics',
        'Transaction history (6 months)',
        'All verification methods',
        'Bank account management (up to 5 accounts)',
        'Frontend UI (with watermark)',
        'Overage: ETB 6 per additional verification',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: true,
      displayOrder: 2,
    },
    {
      name: 'Business',
      description: 'Perfect for growing businesses and medium-sized companies',
      price: 11940, // $199 * 60 ETB
      billingCycle: BillingCycle.MONTHLY,
      limits: {
        verifications_monthly: 10000,
        api_keys: 5,
        team_members: 15,
        webhooks: 10,
        bank_accounts: -1, // Unlimited
        payment_providers: -1, // Unlimited
        custom_branding: true,
        advanced_analytics: true,
        export_functionality: true,
        transaction_history_days: 365,
        api_rate_per_minute: 120,
      },
      features: [
        '10,000 verifications/month',
        'Full API access',
        '5 API keys',
        'Vendor dashboard',
        'Webhook support',
        'Advanced analytics & reporting',
        'Transaction history (12 months)',
        'All verification methods',
        'Bank account management (unlimited)',
        'Custom webhook endpoints',
        'Export functionality (CSV, PDF)',
        'Frontend UI Package (NO watermark)',
        'Custom integration support',
        'Overage: ETB 4.8 per additional verification',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: false,
      displayOrder: 3,
    },
    {
      name: 'Custom',
      description:
        'Perfect for large enterprises, fintech companies, and businesses with specific needs',
      price: 0, // Custom pricing
      billingCycle: BillingCycle.MONTHLY,
      limits: {
        verifications_monthly: -1, // Unlimited
        api_keys: -1, // Unlimited
        team_members: -1, // Unlimited
        webhooks: -1, // Unlimited
        bank_accounts: -1, // Unlimited
        payment_providers: -1, // Unlimited
        custom_branding: true,
        advanced_analytics: true,
        export_functionality: true,
        transaction_history_days: -1, // Unlimited
        api_rate_per_minute: -1, // Unlimited
        white_label: true,
        dedicated_support: true,
        on_premise: true,
      },
      features: [
        'Custom verification limits',
        'Full API access',
        'Unlimited API keys',
        'Vendor dashboard',
        'Webhook support',
        'Advanced analytics & reporting',
        'Transaction history (unlimited)',
        'All verification methods',
        'Bank account management (unlimited)',
        'Custom webhook endpoints',
        'Export functionality (CSV, PDF)',
        'Frontend UI Package (NO watermark)',
        'White-label solution',
        'On-premise deployment option',
        'Custom integrations',
        'Dedicated support',
        'Volume discounts',
        'Custom pricing',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: false,
      displayOrder: 4,
    },
  ];

  for (const planData of plans) {
    const existingPlan = await prisma.plan.findUnique({
      where: { name: planData.name },
    });

    if (!existingPlan) {
      const plan = await prisma.plan.create({
        data: planData,
      });
      console.log(`✅ Created plan: ${plan.name}`);
    } else {
      console.log(`⏭️  Plan already exists: ${planData.name}`);
    }
  }

  console.log('✅ Pricing plans seeding completed!');
}

async function main() {
  try {
    await seedPricingPlans();
  } catch (error) {
    console.error('❌ Error seeding pricing plans:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedPricingPlans };
