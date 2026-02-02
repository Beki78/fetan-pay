import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../../database/prisma.module';
import { SubscriptionModule } from '../../common/subscription.module';
import { NotificationModule } from '../notifications/notification.module';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PricingCleanupService } from './pricing-cleanup.service';
import { SubscriptionExpiryService } from './subscription-expiry.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    SubscriptionModule,
    NotificationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PricingController],
  providers: [PricingService, PricingCleanupService, SubscriptionExpiryService],
  exports: [PricingService, PricingCleanupService, SubscriptionExpiryService],
})
export class PricingModule {}
