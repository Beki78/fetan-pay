-- CreateTable
CREATE TABLE "merchant_branding" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#5CFFCE',
    "secondaryColor" TEXT NOT NULL DEFAULT '#4F46E5',
    "displayName" TEXT,
    "tagline" TEXT,
    "showPoweredBy" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_branding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchant_branding_merchantId_key" ON "merchant_branding"("merchantId");

-- AddForeignKey
ALTER TABLE "merchant_branding" ADD CONSTRAINT "merchant_branding_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
