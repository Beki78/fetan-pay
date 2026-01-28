import { Module } from '@nestjs/common';
import { AdminWebhooksController } from './admin-webhooks.controller';
import { AdminWebhooksService } from './admin-webhooks.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AdminWebhooksController],
  providers: [AdminWebhooksService, PrismaService],
  exports: [AdminWebhooksService],
})
export class AdminWebhooksModule {}
