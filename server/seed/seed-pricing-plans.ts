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
    // Monthly Plans
    {
      name: 'Free',
      description: 'Perfect for testing the platform - 7-day free trial',
      price: 0,
      billingCycle: BillingCycle.MONTHLY,
      limits: {
        verifications_monthly: 20,
        team_members: 1,
        // payment_providers: intentionally omitted - unlimited for free trial
        custom_branding: false,
        advanced_analytics: false,
        tips: false,
      },
      features: [
        '7-day free trial',
        '20 verifications during trial',
        '1 team member',
        'Unlimited webhooks',
        'Basic analytics',
        'Bank account management (unlimited during trial)',
        'All verification methods',
        'Transaction history (30 days)',
        'Verification by usage',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: false,
      displayOrder: 1,
    },
    {
      name: 'Starter',
      description: 'Perfect for small businesses and startups',
      price: 179,
      billingCycle: BillingCycle.MONTHLY,
      limits: {
        verifications_monthly: 100,
        team_members: 5,
        payment_providers: 3,
        custom_branding: false,
        advanced_analytics: true,
        tips: true,
      },
      features: [
        '100 verifications/month',
        '5 team members (employees)',
        'Unlimited webhooks',
        'Advanced analytics',
        'Tips collection',
        'Bank account management (up to 5 accounts)',
        'Verification by usage',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: true,
      displayOrder: 2,
    },
    {
      name: 'Business',
      description: 'Perfect for growing businesses and medium-sized companies',
      price: 999,
      billingCycle: BillingCycle.MONTHLY,
      limits: {
        verifications_monthly: 1000,
        team_members: 15,
        payment_providers: 10, // Unlimited
        custom_branding: true,
        advanced_analytics: true,
        tips: true,
      },
      features: [
        '1000 verifications/month',
        'Full API access',
        'Unlimited API keys',
        '15 team members (employees)',
        'Unlimited webhooks',
        'Advanced analytics & reporting',
        'Tips collection',
        'Custom branding',
        'Bank account management (up to 10 accounts)',
        'Verification by usage',
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
        team_members: -1, // Unlimited
        payment_providers: -1, // Unlimited
        custom_branding: true,
        advanced_analytics: true,
        tips: true,
      },
      features: [
        'Custom verification limits',
        'Full API access',
        'Unlimited API keys',
        'Unlimited team members (employees)',
        'Vendor dashboard',
        'Unlimited webhooks',
        'Advanced analytics & reporting',
        'Tips collection',
        'Custom branding',
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
    // Yearly Plans (with 20% discount)
    {
      name: 'Starter Yearly',
      description:
        'Perfect for small businesses and startups - Save 20% with yearly billing',
      price: 1720, // 179 * 12 * 0.8 = 1720.8 ≈ 1720
      billingCycle: BillingCycle.YEARLY,
      limits: {
        verifications_monthly: 100,
        team_members: 5,
        payment_providers: 3,
        custom_branding: false,
        advanced_analytics: true,
        tips: true,
      },
      features: [
        '100 verifications/month',
        '5 team members (employees)',
        'Unlimited webhooks',
        'Advanced analytics',
        'Tips collection',
        'Bank account management (up to 5 accounts)',
        'Verification by usage',
        '20% discount (2 months free)',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: true,
      displayOrder: 5,
    },
    {
      name: 'Business Yearly',
      description:
        'Perfect for growing businesses and medium-sized companies - Save 20% with yearly billing',
      price: 9590, // 999 * 12 * 0.8 = 9590.4 ≈ 9590
      billingCycle: BillingCycle.YEARLY,
      limits: {
        verifications_monthly: 1000,
        team_members: 15,
        payment_providers: 10,
        custom_branding: true,
        advanced_analytics: true,
        tips: true,
      },
      features: [
        '1000 verifications/month',
        'Full API access',
        'Unlimited API keys',
        '15 team members (employees)',
        'Unlimited webhooks',
        'Advanced analytics & reporting',
        'Tips collection',
        'Custom branding',
        'Bank account management (up to 10 accounts)',
        'Verification by usage',
        '20% discount (2.4 months free)',
      ],
      status: PlanStatus.ACTIVE,
      isPopular: false,
      displayOrder: 6,
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
