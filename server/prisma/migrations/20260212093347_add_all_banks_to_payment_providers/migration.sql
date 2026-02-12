-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionProvider" ADD VALUE 'AMHARA';
ALTER TYPE "TransactionProvider" ADD VALUE 'BIRHAN';
ALTER TYPE "TransactionProvider" ADD VALUE 'CBEBIRR';
ALTER TYPE "TransactionProvider" ADD VALUE 'COOP';
ALTER TYPE "TransactionProvider" ADD VALUE 'ENAT';
ALTER TYPE "TransactionProvider" ADD VALUE 'GADDA';
ALTER TYPE "TransactionProvider" ADD VALUE 'HIBRET';
ALTER TYPE "TransactionProvider" ADD VALUE 'WEGAGEN';
