/*
  Warnings:

  - A unique constraint covering the columns `[walletTransactionId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('DEPOSIT', 'CHARGE', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WalletDepositStatus" AS ENUM ('PENDING', 'VERIFIED', 'UNVERIFIED', 'EXPIRED');

-- AlterTable
ALTER TABLE "merchant" ADD COLUMN     "walletBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "walletChargeType" TEXT,
ADD COLUMN     "walletChargeValue" DECIMAL(10,4),
ADD COLUMN     "walletEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletMinBalance" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "walletChargeAmount" DECIMAL(10,2),
ADD COLUMN     "walletCharged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletTransactionId" TEXT;

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balanceBefore" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "orderId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_deposit_receiver_account" (
    "id" TEXT NOT NULL,
    "provider" "TransactionProvider" NOT NULL,
    "receiverAccount" TEXT NOT NULL,
    "receiverName" TEXT,
    "receiverLabel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_deposit_receiver_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_deposit" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "provider" "TransactionProvider" NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "receiverAccountId" TEXT NOT NULL,
    "status" "WalletDepositStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationPayload" JSONB,
    "walletTransactionId" TEXT,
    "description" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_deposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallet_transaction_merchantId_idx" ON "wallet_transaction"("merchantId");

-- CreateIndex
CREATE INDEX "wallet_transaction_createdAt_idx" ON "wallet_transaction"("createdAt");

-- CreateIndex
CREATE INDEX "wallet_deposit_receiver_account_provider_status_idx" ON "wallet_deposit_receiver_account"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_deposit_receiver_account_provider_receiverAccount_key" ON "wallet_deposit_receiver_account"("provider", "receiverAccount");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_deposit_walletTransactionId_key" ON "wallet_deposit"("walletTransactionId");

-- CreateIndex
CREATE INDEX "wallet_deposit_merchantId_idx" ON "wallet_deposit"("merchantId");

-- CreateIndex
CREATE INDEX "wallet_deposit_provider_reference_idx" ON "wallet_deposit"("provider", "reference");

-- CreateIndex
CREATE INDEX "wallet_deposit_status_idx" ON "wallet_deposit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_deposit_merchantId_provider_reference_key" ON "wallet_deposit"("merchantId", "provider", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "payment_walletTransactionId_key" ON "payment"("walletTransactionId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "wallet_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_deposit" ADD CONSTRAINT "wallet_deposit_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_deposit" ADD CONSTRAINT "wallet_deposit_receiverAccountId_fkey" FOREIGN KEY ("receiverAccountId") REFERENCES "wallet_deposit_receiver_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_deposit" ADD CONSTRAINT "wallet_deposit_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "wallet_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
