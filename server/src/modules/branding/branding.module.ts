import { Module } from '@nestjs/common';
import { BrandingController } from './branding.controller';
import { BrandingService } from './branding.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [BrandingController],
  providers: [BrandingService, PrismaService],
  exports: [BrandingService],
})
export class BrandingModule {}
