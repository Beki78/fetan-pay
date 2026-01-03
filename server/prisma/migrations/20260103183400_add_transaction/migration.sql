-- Create enums if they do not exist
DO $$ BEGIN
    CREATE TYPE "TransactionProvider" AS ENUM ('CBE','TELEBIRR','AWASH','BOA','DASHEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING','VERIFIED','FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create transaction table
CREATE TABLE IF NOT EXISTS "transaction" (
    "id" TEXT NOT NULL,
    "provider" "TransactionProvider" NOT NULL,
    "reference" TEXT NOT NULL,
    "qrUrl" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationPayload" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on provider + reference
CREATE UNIQUE INDEX IF NOT EXISTS "transaction_provider_reference_key"
  ON "transaction"("provider", "reference");

-- Trigger to keep updatedAt in sync
CREATE OR REPLACE FUNCTION set_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_transaction_updated_at ON "transaction";
CREATE TRIGGER set_transaction_updated_at
BEFORE UPDATE ON "transaction"
FOR EACH ROW EXECUTE PROCEDURE set_transaction_updated_at();
