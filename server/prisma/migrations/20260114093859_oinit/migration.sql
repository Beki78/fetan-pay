-- RenameIndex
ALTER INDEX "merchant_receiver_account_unique" RENAME TO "merchant_receiver_account_merchantId_provider_receiverAccou_key";

-- RenameIndex
ALTER INDEX "payment_merchant_provider_reference_unique" RENAME TO "payment_merchantId_provider_reference_key";
