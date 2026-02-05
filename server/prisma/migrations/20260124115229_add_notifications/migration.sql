-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MERCHANT_REGISTRATION', 'MERCHANT_APPROVED', 'MERCHANT_REJECTED', 'MERCHANT_BANNED', 'MERCHANT_UNBANNED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'WALLET_DEPOSIT_VERIFIED', 'WALLET_BALANCE_LOW', 'TEAM_MEMBER_INVITED', 'API_KEY_CREATED', 'WEBHOOK_FAILED', 'SYSTEM_ALERT', 'CAMPAIGN_COMPLETED', 'BRANDING_UPDATED');

-- CreateEnum
CREATE TYPE "NotificationUserType" AS ENUM ('ADMIN', 'MERCHANT_USER');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" "NotificationUserType" NOT NULL,
    "merchantId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "priority" "NotificationPriority" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_userId_isRead_idx" ON "notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notification_userType_merchantId_idx" ON "notification"("userType", "merchantId");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "notification"("type");

-- CreateIndex
CREATE INDEX "notification_priority_idx" ON "notification"("priority");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "email_log"("id") ON DELETE SET NULL ON UPDATE CASCADE;
