-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "PlanAssignmentType" AS ENUM ('IMMEDIATE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "PlanDurationType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "verificationLimit" INTEGER,
    "apiLimit" INTEGER NOT NULL DEFAULT 60,
    "features" TEXT[],
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "currentUsage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_assignment" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "assignmentType" "PlanAssignmentType" NOT NULL DEFAULT 'IMMEDIATE',
    "scheduledDate" TIMESTAMP(3),
    "durationType" "PlanDurationType" NOT NULL DEFAULT 'PERMANENT',
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "plan_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_transaction" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "paymentReference" TEXT,
    "paymentMethod" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "billingPeriodStart" TIMESTAMP(3) NOT NULL,
    "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_name_key" ON "plan"("name");

-- CreateIndex
CREATE INDEX "plan_status_idx" ON "plan"("status");

-- CreateIndex
CREATE INDEX "plan_displayOrder_idx" ON "plan"("displayOrder");

-- CreateIndex
CREATE INDEX "subscription_merchantId_idx" ON "subscription"("merchantId");

-- CreateIndex
CREATE INDEX "subscription_planId_idx" ON "subscription"("planId");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE INDEX "subscription_nextBillingDate_idx" ON "subscription"("nextBillingDate");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_merchantId_key" ON "subscription"("merchantId");

-- CreateIndex
CREATE INDEX "plan_assignment_merchantId_idx" ON "plan_assignment"("merchantId");

-- CreateIndex
CREATE INDEX "plan_assignment_planId_idx" ON "plan_assignment"("planId");

-- CreateIndex
CREATE INDEX "plan_assignment_scheduledDate_idx" ON "plan_assignment"("scheduledDate");

-- CreateIndex
CREATE INDEX "plan_assignment_isApplied_idx" ON "plan_assignment"("isApplied");

-- CreateIndex
CREATE UNIQUE INDEX "billing_transaction_transactionId_key" ON "billing_transaction"("transactionId");

-- CreateIndex
CREATE INDEX "billing_transaction_merchantId_idx" ON "billing_transaction"("merchantId");

-- CreateIndex
CREATE INDEX "billing_transaction_planId_idx" ON "billing_transaction"("planId");

-- CreateIndex
CREATE INDEX "billing_transaction_subscriptionId_idx" ON "billing_transaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "billing_transaction_status_idx" ON "billing_transaction"("status");

-- CreateIndex
CREATE INDEX "billing_transaction_createdAt_idx" ON "billing_transaction"("createdAt");

-- CreateIndex
CREATE INDEX "billing_transaction_transactionId_idx" ON "billing_transaction"("transactionId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_assignment" ADD CONSTRAINT "plan_assignment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_assignment" ADD CONSTRAINT "plan_assignment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_transaction" ADD CONSTRAINT "billing_transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_transaction" ADD CONSTRAINT "billing_transaction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_transaction" ADD CONSTRAINT "billing_transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
