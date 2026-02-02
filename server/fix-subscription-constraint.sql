-- Manual fix for subscription constraint issue
-- Run this if you need to fix the database immediately without running migrations

-- Check current subscription data
SELECT 
    merchant_id, 
    status, 
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as subscription_ids
FROM subscription 
GROUP BY merchant_id, status 
ORDER BY merchant_id, status;

-- Check for merchants with multiple subscriptions
SELECT 
    merchant_id, 
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_subscriptions
FROM subscription 
GROUP BY merchant_id 
HAVING COUNT(*) > 1 OR COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) > 1;

-- Fix the constraint (run these one by one)

-- Step 1: Drop the problematic constraint
DROP INDEX IF EXISTS "subscription_merchantId_key";
ALTER TABLE "subscription" DROP CONSTRAINT IF EXISTS "merchant_active_subscription";

-- Step 2: Create the proper partial unique index
CREATE UNIQUE INDEX "merchant_active_subscription_idx" 
ON "subscription" ("merchantId") 
WHERE "status" = 'ACTIVE';

-- Step 3: Add performance index
CREATE INDEX IF NOT EXISTS "subscription_merchantId_status_idx" 
ON "subscription" ("merchantId", "status");

-- Verify the fix
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'subscription' 
AND indexname LIKE '%merchant%';

-- Test the constraint (should succeed)
-- This should work: multiple subscriptions, only one active
/*
INSERT INTO subscription (id, "merchantId", "planId", status, "startDate", "monthlyPrice", "billingCycle", "createdAt", "updatedAt") 
VALUES 
    (gen_random_uuid(), 'test-merchant', 'test-plan', 'CANCELLED', NOW(), 100, 'MONTHLY', NOW(), NOW()),
    (gen_random_uuid(), 'test-merchant', 'test-plan', 'EXPIRED', NOW(), 200, 'MONTHLY', NOW(), NOW());

-- This should work: one active subscription
INSERT INTO subscription (id, "merchantId", "planId", status, "startDate", "monthlyPrice", "billingCycle", "createdAt", "updatedAt") 
VALUES (gen_random_uuid(), 'test-merchant', 'test-plan', 'ACTIVE', NOW(), 300, 'MONTHLY', NOW(), NOW());

-- This should FAIL: second active subscription
INSERT INTO subscription (id, "merchantId", "planId", status, "startDate", "monthlyPrice", "billingCycle", "createdAt", "updatedAt") 
VALUES (gen_random_uuid(), 'test-merchant', 'test-plan', 'ACTIVE', NOW(), 400, 'MONTHLY', NOW(), NOW());

-- Clean up test data
DELETE FROM subscription WHERE "merchantId" = 'test-merchant';
*/