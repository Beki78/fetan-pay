import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { MerchantUsersModule } from '../merchant-users/merchant-users.module';
import { VerifierModule } from '../verifier/verifier.module';
import { WalletModule } from '../wallet/wallet.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ApiKeyOrSessionGuard } from '../api-keys/guards/api-key-or-session.guard';

@Module({
  imports: [PrismaModule, MerchantUsersModule, VerifierModule, WalletModule, WebhooksModule, ApiKeysModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ApiKeyOrSessionGuard],
})
export class PaymentsModule {}
