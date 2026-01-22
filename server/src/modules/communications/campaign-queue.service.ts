import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { AudienceService, AudienceRecipient } from './audience.service';

export interface CampaignJob {
  campaignId: string;
  batchSize: number;
  delayBetweenBatches: number; // milliseconds
}

@Injectable()
export class CampaignQueueService {
  private readonly logger = new Logger(CampaignQueueService.name);
  private readonly processingCampaigns = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly audienceService: AudienceService,
  ) {}

  /**
   * Start processing a campaign
   */
  async processCampaign(campaignId: string, batchSize = 50, delayBetweenBatches = 1000): Promise<void> {
    if (this.processingCampaigns.has(campaignId)) {
      this.logger.warn(`Campaign ${campaignId} is already being processed`);
      return;
    }

    this.processingCampaigns.add(campaignId);

    try {
      await this.executeCampaign(campaignId, batchSize, delayBetweenBatches);
    } catch (error) {
      this.logger.error(`Failed to process campaign ${campaignId}:`, error);
      await this.markCampaignFailed(campaignId, (error as Error).message);
    } finally {
      this.processingCampaigns.delete(campaignId);
    }
  }

  private async executeCampaign(campaignId: string, batchSize: number, delayBetweenBatches: number): Promise<void> {
    // Get campaign details
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true,
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    if (campaign.status !== 'SCHEDULED' && campaign.status !== 'DRAFT') {
      throw new Error(`Campaign ${campaignId} is not in a sendable state (status: ${campaign.status})`);
    }

    this.logger.log(`Starting campaign: ${campaign.name} (${campaignId})`);

    // Update campaign status to SENDING
    await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENDING',
        sentAt: new Date(),
      },
    });

    // Get audience recipients
    const recipients = await this.audienceService.getAudienceRecipients(
      campaign.audienceSegment,
      campaign.customFilters
    );

    this.logger.log(`Found ${recipients.length} recipients for campaign ${campaignId}`);

    // Update target count
    await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: { targetCount: recipients.length },
    });

    // Process recipients in batches
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      this.logger.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipients.length / batchSize)} for campaign ${campaignId}`);

      const batchResults = await Promise.allSettled(
        batch.map(recipient => this.sendEmailToRecipient(campaign, recipient))
      );

      // Count results
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          sentCount++;
        } else {
          failedCount++;
          this.logger.error(`Failed to send email in campaign ${campaignId}:`, result.reason);
        }
      });

      // Update campaign stats
      await (this.prisma as any).campaign.update({
        where: { id: campaignId },
        data: {
          sentCount,
          failedCount,
        },
      });

      // Delay between batches to avoid overwhelming the email service
      if (i + batchSize < recipients.length) {
        await this.delay(delayBetweenBatches);
      }
    }

    // Mark campaign as completed
    await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        completedAt: new Date(),
        sentCount,
        failedCount,
        deliveredCount: sentCount, // Will be updated by delivery webhooks later
      },
    });

    this.logger.log(`Campaign ${campaignId} completed. Sent: ${sentCount}, Failed: ${failedCount}`);
  }

  private async sendEmailToRecipient(campaign: any, recipient: AudienceRecipient): Promise<void> {
    // Substitute variables in content
    const variables = {
      merchantName: recipient.name,
      merchantEmail: recipient.email,
      merchantId: recipient.merchantId || '',
      merchantBusinessName: recipient.merchantName || '',
      userRole: recipient.role || '',
      loginUrl: process.env.FRONTEND_URL || 'https://admin.fetanpay.et',
      supportEmail: 'support@fetanpay.et',
      supportPhone: '+251911000000',
    };

    const finalSubject = this.substituteVariables(campaign.subject || '', variables);
    const finalContent = this.substituteVariables(campaign.content, variables);

    // Create email log entry
    const emailLog = await (this.prisma as any).emailLog.create({
      data: {
        toEmail: recipient.email,
        subject: finalSubject,
        content: finalContent,
        templateId: campaign.templateId,
        merchantId: recipient.merchantId,
        campaignId: campaign.id,
        sentByUserId: campaign.createdByUserId,
        status: 'PENDING',
      },
    });

    try {
      // Send email using existing EmailService
      await this.sendEmailViaProvider(recipient.email, finalSubject, finalContent);

      // Update status to SENT
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Increment template usage count
      if (campaign.template) {
        await (this.prisma as any).emailTemplate.update({
          where: { id: campaign.template.id },
          data: {
            usageCount: { increment: 1 },
          },
        });
      }
    } catch (error) {
      // Update status to FAILED
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          errorMessage: (error as Error)?.message || 'Unknown error',
        },
      });

      throw error;
    }
  }

  private async sendEmailViaProvider(toEmail: string, subject: string, htmlContent: string): Promise<void> {
    const emailService = this.emailService as any;
    
    if (!emailService.transporter) {
      throw new Error('Email service not properly configured');
    }

    const appName = process.env.APP_NAME || 'FetanPay';
    const smtpFrom = process.env.SMTP_FROM;
    const smtpUser = process.env.SMTP_USER;
    
    let fromAddress: string;
    if (smtpFrom) {
      if (smtpFrom.includes('<') && smtpFrom.includes('>')) {
        fromAddress = smtpFrom;
      } else {
        fromAddress = `"${appName}" <${smtpFrom}>`;
      }
    } else if (smtpUser) {
      fromAddress = `"${appName}" <${smtpUser}>`;
    } else {
      fromAddress = `"${appName}" <noreply@fetanpay.com>`;
    }

    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      subject,
      html: htmlContent,
    };

    const info = await emailService.transporter.sendMail(mailOptions);
    
    this.logger.debug(`Email sent to ${toEmail}`, {
      messageId: info.messageId,
    });

    return info;
  }

  private substituteVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  private async markCampaignFailed(campaignId: string, errorMessage: string): Promise<void> {
    await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
      },
    });

    this.logger.error(`Campaign ${campaignId} marked as failed: ${errorMessage}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get processing status of campaigns
   */
  getProcessingCampaigns(): string[] {
    return Array.from(this.processingCampaigns);
  }

  /**
   * Check if a campaign is currently being processed
   */
  isCampaignProcessing(campaignId: string): boolean {
    return this.processingCampaigns.has(campaignId);
  }
}