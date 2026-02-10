-- CreateTable
CREATE TABLE "admin_merchant_view" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_merchant_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_merchant_view_adminId_idx" ON "admin_merchant_view"("adminId");

-- CreateIndex
CREATE INDEX "admin_merchant_view_merchantId_idx" ON "admin_merchant_view"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_merchant_view_adminId_merchantId_key" ON "admin_merchant_view"("adminId", "merchantId");

-- AddForeignKey
ALTER TABLE "admin_merchant_view" ADD CONSTRAINT "admin_merchant_view_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_merchant_view" ADD CONSTRAINT "admin_merchant_view_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
