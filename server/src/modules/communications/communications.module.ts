import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../../database/prisma.module';
import { CommunicationsController } from './communications.controller';
import { TrackingController } from './tracking.controller';
import { CommunicationsService } from './communications.service';
import { AnalyticsService } from './analytics.service';
import { AudienceService } from './audience.service';
import { CampaignQueueService } from './campaign-queue.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [CommunicationsController, TrackingController],
  providers: [CommunicationsService, AnalyticsService, AudienceService, CampaignQueueService, EmailService, SmsService],
  exports: [CommunicationsService, AnalyticsService, AudienceService, CampaignQueueService],
})
export class CommunicationsModule {}