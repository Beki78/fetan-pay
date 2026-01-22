-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "EmailTemplateCategory" AS ENUM ('WELCOME', 'APPROVAL', 'SECURITY', 'MARKETING', 'REMINDER', 'NOTIFICATION');

-- CreateTable
CREATE TABLE "email_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EmailTemplateCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_log" (
    "id" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "templateId" TEXT,
    "merchantId" TEXT,
    "sentByUserId" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "messageId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_log_merchantId_idx" ON "email_log"("merchantId");

-- CreateIndex
CREATE INDEX "email_log_sentByUserId_idx" ON "email_log"("sentByUserId");

-- CreateIndex
CREATE INDEX "email_log_status_idx" ON "email_log"("status");

-- CreateIndex
CREATE INDEX "email_log_createdAt_idx" ON "email_log"("createdAt");

-- AddForeignKey
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
