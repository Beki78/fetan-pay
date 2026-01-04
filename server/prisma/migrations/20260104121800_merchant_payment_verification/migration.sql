-- This migration was created manually because `prisma migrate dev --create-only`
-- requested a database reset due to previously-modified applied migrations.
-- It is safe to apply in a clean environment and can be adjusted if your DB
-- already contains these tables.

-- CreateEnum
CREATE TYPE "MerchantReceiverAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'CANCELLED', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'UNVERIFIED');

-- CreateTable
CREATE TABLE "merchant_receiver_account" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "provider" "TransactionProvider" NOT NULL,
    "status" "MerchantReceiverAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "receiverLabel" TEXT,
    "receiverAccount" TEXT NOT NULL,
    "receiverName" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_receiver_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "expectedAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT,
    "provider" "TransactionProvider" NOT NULL,
    "reference" TEXT NOT NULL,
    "claimedAmount" DECIMAL(10,2) NOT NULL,
    "tipAmount" DECIMAL(10,2),
    "receiverAccountId" TEXT,
    "status" "PaymentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "mismatchReason" TEXT,
    "verificationPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchant_receiver_account_merchantId_idx" ON "merchant_receiver_account"("merchantId");

-- CreateIndex
CREATE INDEX "merchant_receiver_account_merchantId_provider_status_idx" ON "merchant_receiver_account"("merchantId", "provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_receiver_account_unique" ON "merchant_receiver_account"("merchantId", "provider", "receiverAccount");

-- CreateIndex
CREATE INDEX "order_merchantId_idx" ON "order"("merchantId");

-- CreateIndex
CREATE INDEX "payment_merchantId_idx" ON "payment"("merchantId");

-- CreateIndex
CREATE INDEX "payment_orderId_idx" ON "payment"("orderId");

-- CreateIndex
CREATE INDEX "payment_provider_reference_idx" ON "payment"("provider", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "payment_merchant_provider_reference_unique" ON "payment"("merchantId", "provider", "reference");

-- AddForeignKey
ALTER TABLE "merchant_receiver_account" ADD CONSTRAINT "merchant_receiver_account_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_receiverAccountId_fkey" FOREIGN KEY ("receiverAccountId") REFERENCES "merchant_receiver_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "merchant_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
