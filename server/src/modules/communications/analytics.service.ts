import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import * as crypto from 'crypto';

export interface CampaignAnalytics {
  campaignId: string;
  name: string;
  status: string;
  type: string;
  sentAt?: Date;
  completedAt?: Date;
  
  // Basic metrics
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  
  // Engagement metrics
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  
  // Calculated rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  
  // Cost metrics
  estimatedCost: number;
  actualCost: number;
  costPerEmail: number;
  costPerOpen: number;
  costPerClick: number;
}

export interface EngagementTrend {
  date: string;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  openRate: number;
  clickRate: number;
}

export interface TopPerformingContent {
  subject: string;
  campaignId: string;
  campaignName: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  sentAt: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique tracking ID for email
   */
  generateTrackingId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Track email open event
   */
  async trackEmailOpen(trackingId: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const emailLog = await (this.prisma as any).emailLog.findUnique({
      where: { trackingId },
      include: { campaign: true, merchant: true },
    });

    if (!emailLog) {
      return; // Invalid tracking ID
    }

    // Update email log if first open
    if (!emailLog.openedAt) {
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'OPENED',
          openedAt: new Date(),
          userAgent,
          ipAddress,
        },
      });

      // Update campaign stats
      if (emailLog.campaignId) {
        await (this.prisma as any).campaign.update({
          where: { id: emailLog.campaignId },
          data: {
            openedCount: { increment: 1 },
          },
        });
      }
    }

    // Always increment open count and create engagement event
    await Promise.all([
      (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          openCount: { increment: 1 },
        },
      }),
      (this.prisma as any).engagementEvent.create({
        data: {
          type: 'EMAIL_OPENED',
          emailLogId: emailLog.id,
          campaignId: emailLog.campaignId,
          merchantId: emailLog.merchantId,
          userAgent,
          ipAddress,
          deviceType: this.detectDeviceType(userAgent),
        },
      }),
    ]);
  }

  /**
   * Track email click event
   */
  async trackEmailClick(
    trackingId: string,
    url: string,
    linkText?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const emailLog = await (this.prisma as any).emailLog.findUnique({
      where: { trackingId },
      include: { campaign: true },
    });

    if (!emailLog) {
      return; // Invalid tracking ID
    }

    // Update email log if first click
    if (!emailLog.clickedAt) {
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'CLICKED',
          clickedAt: new Date(),
        },
      });

      // Update campaign stats
      if (emailLog.campaignId) {
        await (this.prisma as any).campaign.update({
          where: { id: emailLog.campaignId },
          data: {
            clickedCount: { increment: 1 },
          },
        });
      }
    }

    // Always increment click count and create records
    await Promise.all([
      (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          clickCount: { increment: 1 },
        },
      }),
      (this.prisma as any).emailClick.create({
        data: {
          emailLogId: emailLog.id,
          url,
          linkText,
          userAgent,
          ipAddress,
          deviceType: this.detectDeviceType(userAgent),
        },
      }),
      (this.prisma as any).engagementEvent.create({
        data: {
          type: 'EMAIL_CLICKED',
          emailLogId: emailLog.id,
          campaignId: emailLog.campaignId,
          merchantId: emailLog.merchantId,
          userAgent,
          ipAddress,
          deviceType: this.detectDeviceType(userAgent),
          metadata: { url, linkText },
        },
      }),
    ]);
  }

  /**
   * Handle unsubscribe request
   */
  async handleUnsubscribe(
    trackingId: string,
    reason?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const emailLog = await (this.prisma as any).emailLog.findUnique({
      where: { trackingId },
      include: { campaign: true },
    });

    if (!emailLog) {
      return; // Invalid tracking ID
    }

    // Add to unsubscribe list
    await (this.prisma as any).unsubscribeList.upsert({
      where: { email: emailLog.toEmail },
      update: {
        reason,
        userAgent,
        ipAddress,
      },
      create: {
        email: emailLog.toEmail,
        merchantId: emailLog.merchantId,
        campaignId: emailLog.campaignId,
        emailLogId: emailLog.id,
        reason,
        userAgent,
        ipAddress,
      },
    });

    // Update email log
    await (this.prisma as any).emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    });

    // Update campaign stats
    if (emailLog.campaignId) {
      await (this.prisma as any).campaign.update({
        where: { id: emailLog.campaignId },
        data: {
          unsubscribedCount: { increment: 1 },
        },
      });
    }

    // Create engagement event
    await (this.prisma as any).engagementEvent.create({
      data: {
        type: 'EMAIL_UNSUBSCRIBED',
        emailLogId: emailLog.id,
        campaignId: emailLog.campaignId,
        merchantId: emailLog.merchantId,
        userAgent,
        ipAddress,
        metadata: { reason },
      },
    });
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const deliveryRate = campaign.sentCount > 0 ? (campaign.deliveredCount / campaign.sentCount) * 100 : 0;
    const openRate = campaign.deliveredCount > 0 ? (campaign.openedCount / campaign.deliveredCount) * 100 : 0;
    const clickRate = campaign.openedCount > 0 ? (campaign.clickedCount / campaign.openedCount) * 100 : 0;
    const bounceRate = campaign.sentCount > 0 ? (campaign.bouncedCount / campaign.sentCount) * 100 : 0;
    const unsubscribeRate = campaign.deliveredCount > 0 ? (campaign.unsubscribedCount / campaign.deliveredCount) * 100 : 0;

    const costPerEmail = campaign.sentCount > 0 ? campaign.actualCost / campaign.sentCount : 0;
    const costPerOpen = campaign.openedCount > 0 ? campaign.actualCost / campaign.openedCount : 0;
    const costPerClick = campaign.clickedCount > 0 ? campaign.actualCost / campaign.clickedCount : 0;

    return {
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      type: campaign.type,
      sentAt: campaign.sentAt,
      completedAt: campaign.completedAt,
      
      targetCount: campaign.targetCount,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      failedCount: campaign.failedCount,
      
      openedCount: campaign.openedCount,
      clickedCount: campaign.clickedCount,
      bouncedCount: campaign.bouncedCount,
      unsubscribedCount: campaign.unsubscribedCount,
      
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
      
      estimatedCost: Number(campaign.estimatedCost),
      actualCost: Number(campaign.actualCost),
      costPerEmail: Math.round(costPerEmail * 10000) / 10000,
      costPerOpen: Math.round(costPerOpen * 10000) / 10000,
      costPerClick: Math.round(costPerClick * 10000) / 10000,
    };
  }

  /**
   * Get engagement trends over time
   */
  async getEngagementTrends(days = 30): Promise<EngagementTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get email logs grouped by date
    const emailLogs = await (this.prisma as any).emailLog.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group by date and calculate metrics
    const trendsMap = new Map<string, { sent: number; opened: number; clicked: number }>();

    emailLogs.forEach((log: any) => {
      const date = log.createdAt.toISOString().split('T')[0];
      
      if (!trendsMap.has(date)) {
        trendsMap.set(date, { sent: 0, opened: 0, clicked: 0 });
      }
      
      const trend = trendsMap.get(date)!;
      
      if (['SENT', 'DELIVERED', 'OPENED', 'CLICKED'].includes(log.status)) {
        trend.sent++;
      }
      
      if (['OPENED', 'CLICKED'].includes(log.status)) {
        trend.opened++;
      }
      
      if (log.status === 'CLICKED') {
        trend.clicked++;
      }
    });

    // Convert to array and sort by date
    const trends = Array.from(trendsMap.entries())
      .map(([date, metrics]) => ({
        date,
        emailsSent: metrics.sent,
        emailsOpened: metrics.opened,
        emailsClicked: metrics.clicked,
        openRate: metrics.sent > 0 ? Math.round((metrics.opened / metrics.sent) * 10000) / 100 : 0,
        clickRate: metrics.opened > 0 ? Math.round((metrics.clicked / metrics.opened) * 10000) / 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  }

  /**
   * Get top performing campaigns
   */
  async getTopPerformingCampaigns(limit = 10): Promise<CampaignAnalytics[]> {
    const campaigns = await (this.prisma as any).campaign.findMany({
      where: {
        status: 'SENT',
        sentCount: { gt: 0 },
      },
      orderBy: [
        { openedCount: 'desc' },
        { clickedCount: 'desc' },
      ],
      take: limit,
    });

    return Promise.all(campaigns.map((campaign: any) => this.getCampaignAnalytics(campaign.id)));
  }

  /**
   * Get overall analytics summary
   */
  async getOverallAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [emailStats, campaignStats, engagementStats] = await Promise.all([
      (this.prisma as any).emailLog.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        _sum: { openCount: true, clickCount: true },
      }),
      (this.prisma as any).campaign.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        _sum: { 
          sentCount: true, 
          deliveredCount: true, 
          openedCount: true, 
          clickedCount: true,
          actualCost: true,
        },
      }),
      (this.prisma as any).engagementEvent.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),
    ]);

    const totalEmails = emailStats._count.id || 0;
    const totalCampaigns = campaignStats._count.id || 0;
    const totalSent = campaignStats._sum.sentCount || 0;
    const totalDelivered = campaignStats._sum.deliveredCount || 0;
    const totalOpened = campaignStats._sum.openedCount || 0;
    const totalClicked = campaignStats._sum.clickedCount || 0;
    const totalCost = Number(campaignStats._sum.actualCost || 0);

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    return {
      totalEmails,
      totalCampaigns,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalCost,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      engagementBreakdown: engagementStats.reduce((acc: any, stat: any) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {}),
    };
  }

  /**
   * Check if email is unsubscribed
   */
  async isEmailUnsubscribed(email: string): Promise<boolean> {
    const unsubscribe = await (this.prisma as any).unsubscribeList.findUnique({
      where: { email },
    });
    return !!unsubscribe;
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }
}