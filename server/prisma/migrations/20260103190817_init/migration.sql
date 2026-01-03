-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MerchantUserRole" AS ENUM ('MERCHANT_OWNER', 'ADMIN', 'ACCOUNTANT', 'SALES', 'WAITER');

-- CreateEnum
CREATE TYPE "MerchantUserStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "merchantId" TEXT,
ADD COLUMN     "tipAmount" DECIMAL(10,2),
ADD COLUMN     "verifiedById" TEXT;

-- CreateTable
CREATE TABLE "merchant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tin" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" "MerchantStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_user" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "userId" TEXT,
    "role" "MerchantUserRole" NOT NULL,
    "status" "MerchantUserStatus" NOT NULL DEFAULT 'INVITED',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "invitedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchant_user_merchantId_idx" ON "merchant_user"("merchantId");

-- CreateIndex
CREATE INDEX "merchant_user_userId_idx" ON "merchant_user"("userId");

-- AddForeignKey
ALTER TABLE "merchant_user" ADD CONSTRAINT "merchant_user_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_user" ADD CONSTRAINT "merchant_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "merchant_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
