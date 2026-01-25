import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../../../database/prisma.service';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, EmailService],
  exports: [NotificationService],
})
export class NotificationModule {}
