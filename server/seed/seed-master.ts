import 'dotenv/config';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Master seed script that runs all seed files in the correct order
 */

const seedFiles = [
  {
    name: 'Main Database Seed',
    file: 'prisma/seed.ts',
    description: 'Seeds users, merchants, payment providers, and basic data',
  },
  {
    name: 'Email Templates Seed',
    file: 'seed/seed-email-templates.ts',
    description: 'Seeds email templates for communications',
  },
  {
    name: 'Notification Templates Seed',
    file: 'seed/seed-notification-templates.ts',
    description: 'Seeds notification email templates for system events',
  },
  {
    name: 'Pricing Plans Seed',
    file: 'seed/seed-pricing-plans.ts',
    description: 'Seeds pricing plans for subscription system',
  },
];

async function runMasterSeed() {
  console.log('🌱 Starting FetanPay Database Seeding Process...\n');

  let successCount = 0;
  let failureCount = 0;

  for (const seedFile of seedFiles) {
    console.log(`📋 Running: ${seedFile.name}`);
    console.log(`📄 File: ${seedFile.file}`);
    console.log(`📝 Description: ${seedFile.description}`);
    console.log('─'.repeat(60));

    try {
      const serverRoot = path.resolve(__dirname, '..');
      const filePath = path.resolve(serverRoot, seedFile.file);
      execSync(`npx ts-node "${filePath}"`, {
        stdio: 'inherit',
        cwd: serverRoot, // Run from server root directory
      });

      console.log(`✅ ${seedFile.name} completed successfully!\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${seedFile.name} failed:`, error);
      console.log(`⚠️  Continuing with next seed file...\n`);
      failureCount++;
    }
  }

  console.log('═'.repeat(60));
  console.log('🏁 FetanPay Database Seeding Summary:');
  console.log(`✅ Successful: ${successCount}/${seedFiles.length}`);
  console.log(`❌ Failed: ${failureCount}/${seedFiles.length}`);

  if (failureCount === 0) {
    console.log('🎉 All seed files completed successfully!');
    console.log('\n📋 What was seeded:');
    seedFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.description}`);
    });
    console.log('\n🚀 Your FetanPay database is ready to use!');
  } else {
    console.log('⚠️  Some seed files failed. Please check the errors above.');
    process.exitCode = 1;
  }
}

runMasterSeed().catch((error) => {
  console.error('💥 Master seed process failed:', error);
  process.exitCode = 1;
});
