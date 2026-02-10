/*
  Warnings:

  - A unique constraint covering the columns `[contactPhone]` on the table `merchant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `merchant_user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "merchant_contactPhone_key" ON "merchant"("contactPhone");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_user_phone_key" ON "merchant_user"("phone");
