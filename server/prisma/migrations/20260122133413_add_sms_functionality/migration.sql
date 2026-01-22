-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'QUEUED');

-- CreateTable
CREATE TABLE "sms_log" (
    "id" TEXT NOT NULL,
    "toPhone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "templateId" TEXT,
    "merchantId" TEXT,
    "sentByUserId" TEXT NOT NULL,
    "campaignId" TEXT,
    "status" "SmsStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "messageId" TEXT,
    "campaignIdProvider" TEXT,
    "metadata" JSONB,
    "sender" TEXT,
    "segmentCount" INTEGER NOT NULL DEFAULT 1,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sms_log_merchantId_idx" ON "sms_log"("merchantId");

-- CreateIndex
CREATE INDEX "sms_log_sentByUserId_idx" ON "sms_log"("sentByUserId");

-- CreateIndex
CREATE INDEX "sms_log_campaignId_idx" ON "sms_log"("campaignId");

-- CreateIndex
CREATE INDEX "sms_log_status_idx" ON "sms_log"("status");

-- CreateIndex
CREATE INDEX "sms_log_createdAt_idx" ON "sms_log"("createdAt");

-- CreateIndex
CREATE INDEX "sms_log_toPhone_idx" ON "sms_log"("toPhone");

-- AddForeignKey
ALTER TABLE "sms_log" ADD CONSTRAINT "sms_log_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_log" ADD CONSTRAINT "sms_log_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_log" ADD CONSTRAINT "sms_log_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
