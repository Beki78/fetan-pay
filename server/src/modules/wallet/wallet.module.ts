import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../../database/prisma.service';
import { VerificationService } from '../verifier/services/verification.service';
import { VerifierModule } from '../verifier/verifier.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [VerifierModule, WebhooksModule, NotificationModule],
  controllers: [WalletController],
  providers: [WalletService, PrismaService],
  exports: [WalletService],
})
export class WalletModule {}
