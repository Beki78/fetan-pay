-- Fix subscription unique constraint to allow subscription history
-- while maintaining one active subscription per merchant

BEGIN;

-- Drop the problematic unique constraint that prevents subscription history
DROP INDEX IF EXISTS "subscription_merchantId_key";
ALTER TABLE "subscription" DROP CONSTRAINT IF EXISTS "merchant_active_subscription";

-- Create a partial unique index that only applies to ACTIVE subscriptions
-- This allows multiple subscriptions per merchant but only one ACTIVE
CREATE UNIQUE INDEX "merchant_active_subscription_idx" 
ON "subscription" ("merchantId") 
WHERE "status" = 'ACTIVE';

-- Add a composite index for better query performance
CREATE INDEX IF NOT EXISTS "subscription_merchantId_status_idx" 
ON "subscription" ("merchantId", "status");

COMMIT;