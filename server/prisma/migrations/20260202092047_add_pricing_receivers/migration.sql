-- AlterTable
ALTER TABLE "billing_transaction" ADD COLUMN     "mismatchReason" TEXT,
ADD COLUMN     "receiverAccountId" TEXT,
ADD COLUMN     "verificationPayload" JSONB,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "pricing_receiver_account" (
    "id" TEXT NOT NULL,
    "provider" "TransactionProvider" NOT NULL,
    "receiverAccount" TEXT NOT NULL,
    "receiverName" TEXT,
    "receiverLabel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_receiver_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_receiver_account_provider_status_idx" ON "pricing_receiver_account"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_receiver_account_provider_receiverAccount_key" ON "pricing_receiver_account"("provider", "receiverAccount");

-- CreateIndex
CREATE INDEX "billing_transaction_receiverAccountId_idx" ON "billing_transaction"("receiverAccountId");

-- AddForeignKey
ALTER TABLE "billing_transaction" ADD CONSTRAINT "billing_transaction_receiverAccountId_fkey" FOREIGN KEY ("receiverAccountId") REFERENCES "pricing_receiver_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
