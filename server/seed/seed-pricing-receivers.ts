import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPricingReceivers() {
  console.log('🌱 Seeding pricing receivers...');

  try {
    // Create pricing receiver accounts for different providers
    const receivers = [
      {
        provider: 'CBE',
        receiverAccount: '1000675169601',
        receiverName: 'MIKYAS MULAT ASMARE',
        receiverLabel: 'FetanPay Pricing - CBE Main',
        status: 'ACTIVE',
      },
      {
        provider: 'TELEBIRR',
        receiverAccount: '0911234567',
        receiverName: 'FETANPAY PRICING',
        receiverLabel: 'FetanPay Pricing - Telebirr',
        status: 'ACTIVE',
      },
      {
        provider: 'AWASH',
        receiverAccount: '0123456789',
        receiverName: 'FETANPAY PRICING ACCOUNT',
        receiverLabel: 'FetanPay Pricing - Awash Bank',
        status: 'ACTIVE',
      },
      {
        provider: 'BOA',
        receiverAccount: '9876543210',
        receiverName: 'FETANPAY SUBSCRIPTION',
        receiverLabel: 'FetanPay Pricing - Bank of Abyssinia',
        status: 'ACTIVE',
      },
    ];

    for (const receiver of receivers) {
      const existingReceiver = await prisma.pricingReceiverAccount.findUnique({
        where: {
          pricing_receiver_unique: {
            provider: receiver.provider as any,
            receiverAccount: receiver.receiverAccount,
          },
        },
      });

      if (!existingReceiver) {
        await prisma.pricingReceiverAccount.create({
          data: {
            provider: receiver.provider as any,
            receiverAccount: receiver.receiverAccount,
            receiverName: receiver.receiverName,
            receiverLabel: receiver.receiverLabel,
            status: receiver.status,
          },
        });
        console.log(`✅ Created pricing receiver: ${receiver.receiverLabel}`);
      } else {
        console.log(
          `⏭️  Pricing receiver already exists: ${receiver.receiverLabel}`,
        );
      }
    }

    console.log('✅ Pricing receivers seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding pricing receivers:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedPricingReceivers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedPricingReceivers };
