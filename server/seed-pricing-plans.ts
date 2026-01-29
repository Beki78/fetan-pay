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
      verificationLimit: 100,
      apiLimit: 60,
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
      verificationLimit: 1000,
      apiLimit: 60,
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
      verificationLimit: 10000,
      apiLimit: 120,
      features: [
        '10,000 verifications/month',
        'Full API access',
        '2 API keys',
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
      verificationLimit: null, // Unlimited
      apiLimit: -1, // Use -1 to represent unlimited instead of null
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
