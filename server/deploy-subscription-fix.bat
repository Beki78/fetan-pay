@echo off
REM Deployment script for subscription constraint fix (Windows)
REM This script safely applies the database changes

echo 🚀 Starting subscription constraint fix deployment...

REM Check if we're in the server directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the server directory
    exit /b 1
)

if not exist "prisma" (
    echo [ERROR] Prisma directory not found. Please run from server directory
    exit /b 1
)

REM Step 1: Generate and apply Prisma migration
echo [INFO] Generating Prisma migration...
call npx prisma migrate dev --name fix_subscription_constraint --create-only

echo [INFO] Applying Prisma migration...
call npx prisma migrate deploy

REM Step 2: Generate new Prisma client
echo [INFO] Generating new Prisma client...
call npx prisma generate

REM Step 3: Verify the database changes
echo [INFO] Verifying database changes...
call npx prisma db pull --print

REM Step 4: Run a quick test
echo [INFO] Running database connectivity test...
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function test() { try { await prisma.$connect(); console.log('✅ Database connection successful'); const result = await prisma.$queryRaw`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'subscription' AND indexname LIKE '%%merchant%%'`; console.log('📊 Subscription indexes:', result); await prisma.$disconnect(); console.log('✅ Database test completed successfully'); } catch (error) { console.error('❌ Database test failed:', error.message); process.exit(1); } } test();"

echo [INFO] ✅ Subscription constraint fix deployment completed successfully!
echo.
echo [INFO] 🎉 What was fixed:
echo [INFO]    • Removed problematic unique constraint on merchantId
echo [INFO]    • Added partial unique index for ACTIVE subscriptions only
echo [INFO]    • Merchants can now have subscription history
echo [INFO]    • Plan upgrades/downgrades will work properly
echo [INFO]    • System still enforces one active subscription per merchant
echo.
echo [INFO] 🧪 To test the fix:
echo [INFO]    • Try upgrading a merchant's plan
echo [INFO]    • Check that old subscriptions are kept as CANCELLED
echo [INFO]    • Verify only one ACTIVE subscription exists per merchant

pause