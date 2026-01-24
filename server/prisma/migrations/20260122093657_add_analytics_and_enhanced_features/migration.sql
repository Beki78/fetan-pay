/*
  Warnings:

  - A unique constraint covering the columns `[trackingId]` on the table `email_log` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EngagementEventType" AS ENUM ('EMAIL_SENT', 'EMAIL_DELIVERED', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'EMAIL_BOUNCED', 'EMAIL_UNSUBSCRIBED', 'CAMPAIGN_STARTED', 'CAMPAIGN_COMPLETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmailStatus" ADD VALUE 'OPENED';
ALTER TYPE "EmailStatus" ADD VALUE 'CLICKED';
ALTER TYPE "EmailStatus" ADD VALUE 'UNSUBSCRIBED';

-- AlterTable
ALTER TABLE "campaign" ADD COLUMN     "abTestVariants" JSONB,
ADD COLUMN     "abTestWinner" TEXT,
ADD COLUMN     "bouncedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clickedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isAbTest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unsubscribedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "email_log" ADD COLUMN     "bouncedAt" TIMESTAMP(3),
ADD COLUMN     "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clickedAt" TIMESTAMP(3),
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "openCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "openedAt" TIMESTAMP(3),
ADD COLUMN     "trackingId" TEXT,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "email_template" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "engagement_event" (
    "id" TEXT NOT NULL,
    "type" "EngagementEventType" NOT NULL,
    "emailLogId" TEXT,
    "campaignId" TEXT,
    "merchantId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "deviceType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_click" (
    "id" TEXT NOT NULL,
    "emailLogId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "linkText" TEXT,
    "position" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "deviceType" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unsubscribe_list" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "merchantId" TEXT,
    "campaignId" TEXT,
    "emailLogId" TEXT,
    "reason" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unsubscribe_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_audience_segment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "segmentType" "AudienceSegmentType" NOT NULL,
    "filters" JSONB NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_audience_segment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engagement_event_type_idx" ON "engagement_event"("type");

-- CreateIndex
CREATE INDEX "engagement_event_emailLogId_idx" ON "engagement_event"("emailLogId");

-- CreateIndex
CREATE INDEX "engagement_event_campaignId_idx" ON "engagement_event"("campaignId");

-- CreateIndex
CREATE INDEX "engagement_event_merchantId_idx" ON "engagement_event"("merchantId");

-- CreateIndex
CREATE INDEX "engagement_event_createdAt_idx" ON "engagement_event"("createdAt");

-- CreateIndex
CREATE INDEX "email_click_emailLogId_idx" ON "email_click"("emailLogId");

-- CreateIndex
CREATE INDEX "email_click_url_idx" ON "email_click"("url");

-- CreateIndex
CREATE INDEX "email_click_clickedAt_idx" ON "email_click"("clickedAt");

-- CreateIndex
CREATE UNIQUE INDEX "unsubscribe_list_email_key" ON "unsubscribe_list"("email");

-- CreateIndex
CREATE INDEX "unsubscribe_list_email_idx" ON "unsubscribe_list"("email");

-- CreateIndex
CREATE INDEX "unsubscribe_list_merchantId_idx" ON "unsubscribe_list"("merchantId");

-- CreateIndex
CREATE INDEX "unsubscribe_list_createdAt_idx" ON "unsubscribe_list"("createdAt");

-- CreateIndex
CREATE INDEX "saved_audience_segment_createdByUserId_idx" ON "saved_audience_segment"("createdByUserId");

-- CreateIndex
CREATE INDEX "saved_audience_segment_segmentType_idx" ON "saved_audience_segment"("segmentType");

-- CreateIndex
CREATE INDEX "saved_audience_segment_createdAt_idx" ON "saved_audience_segment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_log_trackingId_key" ON "email_log"("trackingId");

-- CreateIndex
CREATE INDEX "email_log_trackingId_idx" ON "email_log"("trackingId");

-- AddForeignKey
ALTER TABLE "email_template" ADD CONSTRAINT "email_template_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "email_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_event" ADD CONSTRAINT "engagement_event_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "email_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_event" ADD CONSTRAINT "engagement_event_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_event" ADD CONSTRAINT "engagement_event_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_click" ADD CONSTRAINT "email_click_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "email_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unsubscribe_list" ADD CONSTRAINT "unsubscribe_list_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
