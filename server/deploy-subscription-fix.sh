#!/bin/bash

# Deployment script for subscription constraint fix
# This script safely applies the database changes

set -e  # Exit on any error

echo "🚀 Starting subscription constraint fix deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the server directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    print_error "Please run this script from the server directory"
    exit 1
fi

# Backup database (optional but recommended)
print_status "Creating database backup..."
if command -v pg_dump &> /dev/null; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_status "Creating backup: $BACKUP_FILE"
    # Uncomment and modify the next line with your database connection details
    # pg_dump $DATABASE_URL > $BACKUP_FILE
    print_warning "Database backup skipped. Uncomment pg_dump line if needed."
else
    print_warning "pg_dump not found. Skipping database backup."
fi

# Step 1: Generate and apply Prisma migration
print_status "Generating Prisma migration..."
npx prisma migrate dev --name fix_subscription_constraint --create-only

print_status "Applying Prisma migration..."
npx prisma migrate deploy

# Step 2: Generate new Prisma client
print_status "Generating new Prisma client..."
npx prisma generate

# Step 3: Verify the database changes
print_status "Verifying database changes..."
npx prisma db pull --print

# Step 4: Run a quick test
print_status "Running database connectivity test..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Test basic connection
    await prisma.\$connect();
    console.log('✅ Database connection successful');
    
    // Check if the new index exists
    const result = await prisma.\$queryRaw\`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'subscription' 
      AND indexname LIKE '%merchant%'
    \`;
    
    console.log('📊 Subscription indexes:', result);
    
    await prisma.\$disconnect();
    console.log('✅ Database test completed successfully');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

test();
"

# Step 5: Restart the application (if using PM2 or similar)
if command -v pm2 &> /dev/null; then
    print_status "Restarting application with PM2..."
    pm2 restart all
elif [ -f ".env" ] && grep -q "NODE_ENV=production" .env; then
    print_warning "Production environment detected. Please restart your application manually."
else
    print_status "Development environment. You can restart with 'npm run start:dev'"
fi

print_status "✅ Subscription constraint fix deployment completed successfully!"
print_status ""
print_status "🎉 What was fixed:"
print_status "   • Removed problematic unique constraint on merchantId"
print_status "   • Added partial unique index for ACTIVE subscriptions only"
print_status "   • Merchants can now have subscription history"
print_status "   • Plan upgrades/downgrades will work properly"
print_status "   • System still enforces one active subscription per merchant"
print_status ""
print_status "🧪 To test the fix:"
print_status "   • Try upgrading a merchant's plan"
print_status "   • Check that old subscriptions are kept as CANCELLED"
print_status "   • Verify only one ACTIVE subscription exists per merchant"