/*
  Warnings:

  - You are about to drop the column `apiLimit` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `verificationLimit` on the `plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plan" DROP COLUMN "apiLimit",
DROP COLUMN "verificationLimit",
ADD COLUMN     "limits" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "subscription_usage" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "usage" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscription_usage_merchantId_idx" ON "subscription_usage"("merchantId");

-- CreateIndex
CREATE INDEX "subscription_usage_period_idx" ON "subscription_usage"("period");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_usage_merchantId_period_key" ON "subscription_usage"("merchantId", "period");

-- AddForeignKey
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
