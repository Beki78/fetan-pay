import { Module, Global } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { UsageTrackerService } from './services/usage-tracker.service';
import { SubscriptionGuard } from './guards/subscription.guard';
import { PrismaService } from '../../database/prisma.service';

@Global()
@Module({
  providers: [
    SubscriptionService,
    UsageTrackerService,
    SubscriptionGuard,
    PrismaService,
  ],
  exports: [SubscriptionService, UsageTrackerService, SubscriptionGuard],
})
export class SubscriptionModule {}
