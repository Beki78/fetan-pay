import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../../database/prisma.service';
import { MerchantUsersModule } from '../merchant-users/merchant-users.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { SubscriptionModule } from '../../common/subscription.module';
import { ApiKeyOrSessionGuard } from '../api-keys/guards/api-key-or-session.guard';

@Module({
  imports: [MerchantUsersModule, ApiKeysModule, SubscriptionModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService, ApiKeyOrSessionGuard],
  exports: [WebhooksService],
})
export class WebhooksModule {}
