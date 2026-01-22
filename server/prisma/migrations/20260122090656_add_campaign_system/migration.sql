-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('EMAIL', 'SMS', 'BOTH');

-- CreateEnum
CREATE TYPE "AudienceSegmentType" AS ENUM ('ALL_MERCHANTS', 'PENDING_MERCHANTS', 'ACTIVE_MERCHANTS', 'BANNED_USERS', 'INACTIVE_MERCHANTS', 'HIGH_VOLUME_MERCHANTS', 'NEW_SIGNUPS', 'MERCHANT_OWNERS', 'WAITERS', 'CUSTOM_FILTER');

-- AlterTable
ALTER TABLE "email_log" ADD COLUMN     "campaignId" TEXT;

-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "templateId" TEXT,
    "audienceSegment" "AudienceSegmentType" NOT NULL,
    "customFilters" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "targetCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "actualCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_status_idx" ON "campaign"("status");

-- CreateIndex
CREATE INDEX "campaign_createdByUserId_idx" ON "campaign"("createdByUserId");

-- CreateIndex
CREATE INDEX "campaign_scheduledAt_idx" ON "campaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "campaign_createdAt_idx" ON "campaign"("createdAt");

-- CreateIndex
CREATE INDEX "email_log_campaignId_idx" ON "email_log"("campaignId");

-- AddForeignKey
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
