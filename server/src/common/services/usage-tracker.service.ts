import { Injectable } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class UsageTrackerService {
  constructor(private subscriptionService: SubscriptionService) {}

  /**
   * Track verification usage after successful payment verification
   */
  async trackVerification(merchantId: string): Promise<void> {
    await this.subscriptionService.incrementUsage(
      merchantId,
      'verifications_monthly',
      1,
    );
  }

  /**
   * Track API call usage (can be called from middleware)
   */
  async trackApiCall(merchantId: string): Promise<void> {
    await this.subscriptionService.incrementUsage(
      merchantId,
      'api_calls_daily',
      1,
    );
  }

  /**
   * Track webhook delivery
   */
  async trackWebhookDelivery(merchantId: string): Promise<void> {
    await this.subscriptionService.incrementUsage(
      merchantId,
      'webhooks_sent',
      1,
    );
  }

  /**
   * Track any custom usage
   */
  async trackCustomUsage(
    merchantId: string,
    feature: string,
    amount: number = 1,
  ): Promise<void> {
    await this.subscriptionService.incrementUsage(merchantId, feature, amount);
  }
}
