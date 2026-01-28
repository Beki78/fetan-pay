-- CreateEnum
CREATE TYPE "IPAddressStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "merchant" ADD COLUMN     "ipWhitelistEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ip_address" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "description" TEXT,
    "status" "IPAddressStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ip_address_merchantId_idx" ON "ip_address"("merchantId");

-- CreateIndex
CREATE INDEX "ip_address_merchantId_status_idx" ON "ip_address"("merchantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ip_address_merchantId_ipAddress_key" ON "ip_address"("merchantId", "ipAddress");

-- AddForeignKey
ALTER TABLE "ip_address" ADD CONSTRAINT "ip_address_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
