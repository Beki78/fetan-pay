import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../../database/prisma.service';
import { MerchantUsersModule } from '../merchant-users/merchant-users.module';

@Module({
  imports: [MerchantUsersModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
