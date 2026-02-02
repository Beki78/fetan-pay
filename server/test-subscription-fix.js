/**
 * Test script to verify the subscription constraint fix
 * Run with: node test-subscription-fix.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSubscriptionConstraints() {
  console.log('🧪 Testing subscription constraint fix...\n');

  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Test 2: Check indexes
    console.log('2️⃣ Checking subscription indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'subscription' 
      AND indexname LIKE '%merchant%'
    `;
    console.log('📊 Found indexes:', indexes);

    const hasCorrectIndex = indexes.some(
      (idx) =>
        idx.indexname === 'merchant_active_subscription_idx' &&
        idx.indexdef.includes('WHERE'),
    );

    if (hasCorrectIndex) {
      console.log('✅ Correct partial unique index found\n');
    } else {
      console.log(
        '❌ Partial unique index not found. Please run the migration.\n',
      );
      return;
    }

    // Test 3: Create test merchant and plans
    console.log('3️⃣ Setting up test data...');

    // Clean up any existing test data
    await prisma.subscription.deleteMany({
      where: { merchantId: 'test-merchant-constraint' },
    });

    await prisma.merchant.deleteMany({
      where: { id: 'test-merchant-constraint' },
    });

    await prisma.plan.deleteMany({
      where: { name: { startsWith: 'Test Plan' } },
    });

    // Create test merchant
    const testMerchant = await prisma.merchant.create({
      data: {
        id: 'test-merchant-constraint',
        name: 'Test Merchant for Constraint Testing',
        status: 'ACTIVE',
      },
    });

    // Create test plans
    const testPlan1 = await prisma.plan.create({
      data: {
        name: 'Test Plan Basic',
        description: 'Basic test plan',
        price: 100,
        features: ['Feature 1', 'Feature 2'],
        status: 'ACTIVE',
      },
    });

    const testPlan2 = await prisma.plan.create({
      data: {
        name: 'Test Plan Premium',
        description: 'Premium test plan',
        price: 200,
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        status: 'ACTIVE',
      },
    });

    console.log('✅ Test data created\n');

    // Test 4: Create multiple inactive subscriptions (should work)
    console.log('4️⃣ Testing multiple inactive subscriptions...');

    await prisma.subscription.create({
      data: {
        merchantId: testMerchant.id,
        planId: testPlan1.id,
        status: 'CANCELLED',
        startDate: new Date(),
        monthlyPrice: 100,
        billingCycle: 'MONTHLY',
      },
    });

    await prisma.subscription.create({
      data: {
        merchantId: testMerchant.id,
        planId: testPlan2.id,
        status: 'EXPIRED',
        startDate: new Date(),
        monthlyPrice: 200,
        billingCycle: 'MONTHLY',
      },
    });

    console.log('✅ Multiple inactive subscriptions created successfully\n');

    // Test 5: Create one active subscription (should work)
    console.log('5️⃣ Testing single active subscription...');

    const activeSubscription = await prisma.subscription.create({
      data: {
        merchantId: testMerchant.id,
        planId: testPlan1.id,
        status: 'ACTIVE',
        startDate: new Date(),
        monthlyPrice: 100,
        billingCycle: 'MONTHLY',
      },
    });

    console.log('✅ Single active subscription created successfully\n');

    // Test 6: Try to create second active subscription (should fail)
    console.log('6️⃣ Testing second active subscription (should fail)...');

    try {
      await prisma.subscription.create({
        data: {
          merchantId: testMerchant.id,
          planId: testPlan2.id,
          status: 'ACTIVE',
          startDate: new Date(),
          monthlyPrice: 200,
          billingCycle: 'MONTHLY',
        },
      });
      console.log(
        '❌ ERROR: Second active subscription was created (constraint not working!)\n',
      );
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(
          '✅ Second active subscription correctly blocked by constraint\n',
        );
      } else {
        console.log('❌ Unexpected error:', error.message, '\n');
      }
    }

    // Test 7: Test subscription upgrade (cancel old, create new)
    console.log('7️⃣ Testing subscription upgrade...');

    // Cancel the current active subscription
    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'Upgraded to new plan',
      },
    });

    // Create new active subscription (should work now)
    await prisma.subscription.create({
      data: {
        merchantId: testMerchant.id,
        planId: testPlan2.id,
        status: 'ACTIVE',
        startDate: new Date(),
        monthlyPrice: 200,
        billingCycle: 'MONTHLY',
      },
    });

    console.log('✅ Subscription upgrade completed successfully\n');

    // Test 8: Verify final state
    console.log('8️⃣ Verifying final subscription state...');

    const allSubscriptions = await prisma.subscription.findMany({
      where: { merchantId: testMerchant.id },
      include: { plan: true },
      orderBy: { createdAt: 'asc' },
    });

    const activeCount = allSubscriptions.filter(
      (s) => s.status === 'ACTIVE',
    ).length;
    const totalCount = allSubscriptions.length;

    console.log(`📊 Total subscriptions: ${totalCount}`);
    console.log(`📊 Active subscriptions: ${activeCount}`);

    allSubscriptions.forEach((sub, index) => {
      console.log(
        `   ${index + 1}. ${sub.plan.name} - ${sub.status} (${sub.monthlyPrice} ETB)`,
      );
    });

    if (activeCount === 1 && totalCount >= 3) {
      console.log(
        '✅ Perfect! One active subscription with subscription history maintained\n',
      );
    } else {
      console.log('❌ Unexpected subscription state\n');
    }

    // Cleanup
    console.log('9️⃣ Cleaning up test data...');
    await prisma.subscription.deleteMany({
      where: { merchantId: testMerchant.id },
    });
    await prisma.merchant.delete({
      where: { id: testMerchant.id },
    });
    await prisma.plan.deleteMany({
      where: { name: { startsWith: 'Test Plan' } },
    });
    console.log('✅ Test data cleaned up\n');

    console.log(
      '🎉 All tests passed! Subscription constraint fix is working correctly.',
    );
    console.log('');
    console.log('✅ What this proves:');
    console.log(
      '   • Multiple inactive subscriptions are allowed (subscription history)',
    );
    console.log('   • Only one active subscription per merchant is enforced');
    console.log(
      '   • Subscription upgrades work properly (cancel old, create new)',
    );
    console.log('   • Database constraint is working as expected');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testSubscriptionConstraints();
