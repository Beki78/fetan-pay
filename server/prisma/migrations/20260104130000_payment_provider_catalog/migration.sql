-- Manual migration: payment provider catalog
-- Created manually because prisma migrate dev requested a DB reset due to previously-modified applied migrations.

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('ACTIVE', 'COMING_SOON', 'DISABLED');

-- CreateTable
CREATE TABLE "payment_provider" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "status" "ProviderStatus" NOT NULL DEFAULT 'COMING_SOON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_code_key" ON "payment_provider"("code");

-- CreateIndex
CREATE INDEX "payment_provider_status_idx" ON "payment_provider"("status");
