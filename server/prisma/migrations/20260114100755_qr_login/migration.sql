/*
  Warnings:

  - A unique constraint covering the columns `[qrCodeToken]` on the table `merchant_user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "merchant_user" ADD COLUMN     "encryptedPassword" TEXT,
ADD COLUMN     "qrCodeGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "qrCodeToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "merchant_user_qrCodeToken_key" ON "merchant_user"("qrCodeToken");

-- CreateIndex
CREATE INDEX "merchant_user_qrCodeToken_idx" ON "merchant_user"("qrCodeToken");
