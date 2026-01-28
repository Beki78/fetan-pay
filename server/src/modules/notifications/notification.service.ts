import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { CommunicationsService } from '../communications/communications.service';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationType =
  | 'MERCHANT_REGISTRATION'
  | 'MERCHANT_APPROVED'
  | 'MERCHANT_REJECTED'
  | 'MERCHANT_BANNED'
  | 'MERCHANT_UNBANNED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'WALLET_DEPOSIT_VERIFIED'
  | 'WALLET_BALANCE_LOW'
  | 'TEAM_MEMBER_INVITED'
  | 'API_KEY_CREATED'
  | 'WEBHOOK_FAILED'
  | 'SYSTEM_ALERT'
  | 'CAMPAIGN_COMPLETED'
  | 'BRANDING_UPDATED'
  | 'IP_ADDRESS_DISABLED'
  | 'IP_ADDRESS_ENABLED';

export type NotificationUserType = 'ADMIN' | 'MERCHANT_USER';

export interface CreateNotificationParams {
  userId: string;
  userType: NotificationUserType;
  merchantId?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: any;
  sendEmail?: boolean;
  emailTemplate?: string;
  emailVariables?: Record<string, any>;
}

export interface NotificationFilters {
  userId?: string;
  userType?: NotificationUserType;
  merchantId?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  unreadOnly?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create a new notification (in-app + optional email)
   */
  async createNotification(params: CreateNotificationParams) {
    try {
      // Create in-app notification
      const notification = await (this.prisma as any).notification.create({
        data: {
          userId: params.userId,
          userType: params.userType,
          merchantId: params.merchantId,
          type: params.type,
          title: params.title,
          message: params.message,
          priority: params.priority,
          data: params.data,
          emailSent: false,
        },
      });

      // Send email if requested and priority is HIGH or CRITICAL
      if (params.sendEmail && ['HIGH', 'CRITICAL'].includes(params.priority)) {
        await this.sendEmailNotification(
          notification.id,
          params.emailTemplate,
          params.emailVariables,
        );
      }

      this.logger.log(
        `Created notification ${notification.id} for user ${params.userId}`,
      );
      return notification;
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get notifications for a user with pagination
   */
  async getNotifications(
    userId: string,
    filters: NotificationFilters = {},
    options: PaginationOptions = {},
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...filters,
    };

    if (filters.unreadOnly) {
      where.isRead = false;
      delete where.unreadOnly;
    }

    const [notifications, total] = await Promise.all([
      (this.prisma as any).notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          merchant: {
            select: { id: true, name: true },
          },
        },
      }),
      (this.prisma as any).notification.count({ where }),
    ]);

    return {
      data: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string, merchantId?: string) {
    const where: any = {
      userId,
      isRead: false,
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    return await (this.prisma as any).notification.count({ where });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await (this.prisma as any).notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await (this.prisma as any).notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, merchantId?: string) {
    const where: any = {
      userId,
      isRead: false,
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    return await (this.prisma as any).notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notificationId: string,
    templateName?: string,
    variables?: Record<string, any>,
  ) {
    try {
      const notification = await (this.prisma as any).notification.findUnique({
        where: { id: notificationId },
        include: {
          merchant: true,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Get user email from Better Auth
      const user = await (this.prisma as any).user.findUnique({
        where: { id: notification.userId },
      });

      if (!user?.email) {
        this.logger.warn(`No email found for user ${notification.userId}`);
        return;
      }

      // Get email template if specified
      let emailTemplate: any = null;
      if (templateName) {
        emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
          where: {
            name: templateName,
            isActive: true,
          },
        });

        if (!emailTemplate) {
          this.logger.warn(
            `Email template '${templateName}' not found or inactive`,
          );
        }
      }

      let subject = notification.title;
      let content = notification.message;

      // Use template if available
      if (emailTemplate) {
        subject = this.substituteVariables(
          emailTemplate.subject,
          variables || {},
        );
        content = this.substituteVariables(
          emailTemplate.content,
          variables || {},
        );
      }

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: user.email,
          subject,
          content,
          templateId: emailTemplate?.id,
          merchantId: notification.merchantId,
          sentByUserId: 'system', // System-generated email
          status: 'PENDING',
        },
      });

      // Send email using existing EmailService
      await this.sendEmailViaProvider(user.email, subject, content);

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Update notification with email log reference
      await (this.prisma as any).notification.update({
        where: { id: notificationId },
        data: {
          emailSent: true,
          emailLogId: emailLog.id,
        },
      });

      this.logger.log(
        `Email sent for notification ${notificationId} to ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email for notification ${notificationId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send email using the existing EmailService
   */
  private async sendEmailViaProvider(
    email: string,
    subject: string,
    content: string,
  ) {
    // Use the existing EmailService method (we'll need to extend it)
    // For now, we'll create a simple HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">${subject}</h2>
        <div style="margin: 16px 0;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #475569; font-size: 14px;">
          This is an automated notification from FetanPay.
        </p>
      </div>
    `;

    // We'll need to extend EmailService to support HTML content
    // For now, let's use a direct nodemailer approach
    await this.emailService.sendNotificationEmail(email, subject, htmlContent);
  }

  /**
   * Substitute variables in template content
   */
  private substituteVariables(
    content: string,
    variables: Record<string, any>,
  ): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  /**
   * Helper methods for specific notification types
   */

  async notifyMerchantRegistration(merchantId: string, merchantName: string) {
    // Get all admin users
    const adminUsers = await (this.prisma as any).user.findMany({
      where: { role: 'SUPERADMIN' },
    });

    for (const admin of adminUsers) {
      await this.createNotification({
        userId: admin.id,
        userType: 'ADMIN',
        type: 'MERCHANT_REGISTRATION',
        title: 'New Merchant Registration',
        message: `A new merchant "${merchantName}" has registered and is pending approval.`,
        priority: 'HIGH',
        data: { merchantId, merchantName },
        sendEmail: true,
        emailTemplate: 'merchant-registration',
        emailVariables: { merchantName, merchantId },
      });
    }
  }

  async notifyMerchantApproval(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
  ) {
    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'MERCHANT_APPROVED',
      title: 'Merchant Account Approved',
      message: `Congratulations! Your merchant account "${merchantName}" has been approved and is now active.`,
      priority: 'HIGH',
      data: { merchantId, merchantName },
      sendEmail: true,
      emailTemplate: 'merchant-approval',
      emailVariables: { merchantName },
    });
  }

  /**
   * Send merchant approval notification directly to email (fallback when no Better Auth user exists)
   */
  async notifyMerchantApprovalByEmail(
    merchantId: string,
    merchantName: string,
    ownerEmail: string,
  ) {
    try {
      // Get email template
      const emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
        where: {
          name: 'merchant-approval',
          isActive: true,
        },
      });

      if (!emailTemplate) {
        this.logger.warn(
          `Email template 'merchant-approval' not found or inactive`,
        );
        return;
      }

      const variables = { merchantName };
      const subject = this.substituteVariables(
        emailTemplate.subject,
        variables,
      );
      const content = this.substituteVariables(
        emailTemplate.content,
        variables,
      );

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: ownerEmail,
          subject,
          content,
          templateId: emailTemplate.id,
          merchantId: merchantId,
          sentByUserId: 'system',
          status: 'PENDING',
        },
      });

      // Send email directly
      await this.emailService.sendNotificationEmail(
        ownerEmail,
        subject,
        content,
      );

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Merchant approval email sent directly to ${ownerEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send merchant approval email to ${ownerEmail}: ${error.message}`,
        error.stack,
      );
    }
  }

  async notifyMerchantRejection(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
    reason?: string,
  ) {
    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'MERCHANT_REJECTED',
      title: 'Merchant Account Rejected',
      message: `Your merchant account "${merchantName}" has been rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
      priority: 'HIGH',
      data: { merchantId, merchantName, reason },
      sendEmail: true,
      emailTemplate: 'merchant-rejection',
      emailVariables: {
        merchantName,
        reason: reason || 'No specific reason provided',
      },
    });
  }

  /**
   * Send merchant rejection notification directly to email (fallback when no Better Auth user exists)
   */
  async notifyMerchantRejectionByEmail(
    merchantId: string,
    merchantName: string,
    ownerEmail: string,
    reason?: string,
  ) {
    try {
      // Get email template
      const emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
        where: {
          name: 'merchant-rejection',
          isActive: true,
        },
      });

      if (!emailTemplate) {
        this.logger.warn(
          `Email template 'merchant-rejection' not found or inactive`,
        );
        return;
      }

      const variables = {
        merchantName,
        reason: reason || 'No specific reason provided',
      };
      const subject = this.substituteVariables(
        emailTemplate.subject,
        variables,
      );
      const content = this.substituteVariables(
        emailTemplate.content,
        variables,
      );

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: ownerEmail,
          subject,
          content,
          templateId: emailTemplate.id,
          merchantId: merchantId,
          sentByUserId: 'system',
          status: 'PENDING',
        },
      });

      // Send email directly
      await this.emailService.sendNotificationEmail(
        ownerEmail,
        subject,
        content,
      );

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(
        `Merchant rejection email sent directly to ${ownerEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send merchant rejection email to ${ownerEmail}: ${error.message}`,
        error.stack,
      );
    }
  }

  async notifyMerchantBan(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
    reason?: string,
  ) {
    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'MERCHANT_BANNED',
      title: 'Merchant Account Suspended',
      message: `Your merchant account "${merchantName}" has been suspended. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
      priority: 'HIGH',
      data: { merchantId, merchantName, reason },
      sendEmail: true,
      emailTemplate: 'merchant-banned',
      emailVariables: {
        merchantName,
        reason: reason || 'No specific reason provided',
      },
    });
  }

  async notifyMerchantUnban(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
  ) {
    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'MERCHANT_UNBANNED',
      title: 'Merchant Account Reactivated',
      message: `Your merchant account "${merchantName}" has been reactivated and is now available for use.`,
      priority: 'HIGH',
      data: { merchantId, merchantName },
      sendEmail: true,
      emailTemplate: 'merchant-unbanned',
      emailVariables: { merchantName },
    });
  }

  /**
   * Send merchant ban notification directly to email (fallback when no Better Auth user exists)
   */
  async notifyMerchantBanByEmail(
    merchantId: string,
    merchantName: string,
    ownerEmail: string,
    reason?: string,
  ) {
    try {
      // Get email template
      const emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
        where: {
          name: 'merchant-banned',
          isActive: true,
        },
      });

      if (!emailTemplate) {
        this.logger.warn(
          `Email template 'merchant-banned' not found or inactive`,
        );
        return;
      }

      const variables = {
        merchantName,
        reason: reason || 'No specific reason provided',
      };
      const subject = this.substituteVariables(
        emailTemplate.subject,
        variables,
      );
      const content = this.substituteVariables(
        emailTemplate.content,
        variables,
      );

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: ownerEmail,
          subject,
          content,
          templateId: emailTemplate.id,
          merchantId: merchantId,
          sentByUserId: 'system',
          status: 'PENDING',
        },
      });

      // Send email directly
      await this.emailService.sendNotificationEmail(
        ownerEmail,
        subject,
        content,
      );

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Merchant ban email sent directly to ${ownerEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send merchant ban email to ${ownerEmail}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send merchant unban notification directly to email (fallback when no Better Auth user exists)
   */
  async notifyMerchantUnbanByEmail(
    merchantId: string,
    merchantName: string,
    ownerEmail: string,
  ) {
    try {
      // Get email template
      const emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
        where: {
          name: 'merchant-unbanned',
          isActive: true,
        },
      });

      if (!emailTemplate) {
        this.logger.warn(
          `Email template 'merchant-unbanned' not found or inactive`,
        );
        return;
      }

      const variables = { merchantName };
      const subject = this.substituteVariables(
        emailTemplate.subject,
        variables,
      );
      const content = this.substituteVariables(
        emailTemplate.content,
        variables,
      );

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: ownerEmail,
          subject,
          content,
          templateId: emailTemplate.id,
          merchantId: merchantId,
          sentByUserId: 'system',
          status: 'PENDING',
        },
      });

      // Send email directly
      await this.emailService.sendNotificationEmail(
        ownerEmail,
        subject,
        content,
      );

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Merchant unban email sent directly to ${ownerEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send merchant unban email to ${ownerEmail}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Notify merchant about successful wallet deposit
   */
  async notifyWalletDepositVerified(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
    depositDetails: {
      amount: number;
      provider: string;
      reference: string;
      newBalance: number;
    },
  ) {
    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'WALLET_DEPOSIT_VERIFIED',
      title: 'Wallet Deposit Confirmed',
      message: `Your wallet deposit of ${depositDetails.amount} ETB via ${depositDetails.provider} has been verified. New balance: ${depositDetails.newBalance} ETB`,
      priority: 'HIGH',
      data: { merchantId, merchantName, ...depositDetails },
      sendEmail: true,
      emailTemplate: 'wallet-deposit-verified-merchant',
      emailVariables: {
        merchantName,
        amount: depositDetails.amount.toString(),
        provider: depositDetails.provider,
        reference: depositDetails.reference,
        newBalance: depositDetails.newBalance.toString(),
      },
    });
  }

  /**
   * Send wallet deposit notification directly to merchant email (fallback when no Better Auth user exists)
   */
  async notifyWalletDepositVerifiedByEmail(
    merchantId: string,
    merchantName: string,
    ownerEmail: string,
    depositDetails: {
      amount: number;
      provider: string;
      reference: string;
      newBalance: number;
    },
  ) {
    try {
      // Get email template
      const emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
        where: {
          name: 'wallet-deposit-verified-merchant',
          isActive: true,
        },
      });

      if (!emailTemplate) {
        this.logger.warn(
          `Email template 'wallet-deposit-verified-merchant' not found or inactive`,
        );
        return;
      }

      const variables = {
        merchantName,
        amount: depositDetails.amount.toString(),
        provider: depositDetails.provider,
        reference: depositDetails.reference,
        newBalance: depositDetails.newBalance.toString(),
      };
      const subject = this.substituteVariables(
        emailTemplate.subject,
        variables,
      );
      const content = this.substituteVariables(
        emailTemplate.content,
        variables,
      );

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: ownerEmail,
          subject,
          content,
          templateId: emailTemplate.id,
          merchantId: merchantId,
          sentByUserId: 'system',
          status: 'PENDING',
        },
      });

      // Send email directly
      await this.emailService.sendNotificationEmail(
        ownerEmail,
        subject,
        content,
      );

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Wallet deposit email sent directly to ${ownerEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send wallet deposit email to ${ownerEmail}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Notify admins about merchant wallet deposit
   */
  async notifyAdminsWalletDeposit(
    merchantId: string,
    merchantName: string,
    depositDetails: {
      amount: number;
      provider: string;
      reference: string;
      newBalance: number;
    },
  ) {
    // Get all admin users
    const adminUsers = await (this.prisma as any).user.findMany({
      where: { role: 'SUPERADMIN' },
    });

    for (const admin of adminUsers) {
      await this.createNotification({
        userId: admin.id,
        userType: 'ADMIN',
        type: 'WALLET_DEPOSIT_VERIFIED',
        title: 'Merchant Wallet Deposit',
        message: `${merchantName} deposited ${depositDetails.amount} ETB via ${depositDetails.provider}. New balance: ${depositDetails.newBalance} ETB`,
        priority: 'MEDIUM',
        data: { merchantId, merchantName, ...depositDetails },
        sendEmail: true,
        emailTemplate: 'wallet-deposit-verified-admin',
        emailVariables: {
          merchantName,
          merchantId,
          amount: depositDetails.amount.toString(),
          provider: depositDetails.provider,
          reference: depositDetails.reference,
          newBalance: depositDetails.newBalance.toString(),
        },
      });
    }
  }

  /**
   * Notify merchant about branding update
   */
  async notifyBrandingUpdated(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
    updatedElements: string[],
  ) {
    const updatedElementsText =
      updatedElements.length > 0
        ? updatedElements.join(', ')
        : 'Branding settings updated';

    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'BRANDING_UPDATED',
      title: 'Branding Updated',
      message: `Your merchant branding has been updated. Changes: ${updatedElementsText}`,
      priority: 'LOW',
      data: { merchantId, merchantName, updatedElements },
      sendEmail: false, // In-app notification only as per requirements
    });
  }

  /**
   * Notify merchant about IP address being disabled by admin
   */
  async notifyIPAddressDisabled(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
    ipAddress: string,
    reason?: string,
  ) {
    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'IP_ADDRESS_DISABLED',
      title: 'IP Address Disabled',
      message: `Your IP address ${ipAddress} has been disabled by an administrator. ${reason ? `Reason: ${reason}` : 'This may affect your API access. Please contact support if you need assistance.'}`,
      priority: 'HIGH',
      data: { merchantId, merchantName, ipAddress, reason },
      sendEmail: true,
      emailTemplate: 'ip-address-disabled',
      emailVariables: {
        merchantName,
        ipAddress,
        reason: reason || 'No specific reason provided',
      },
    });
  }

  /**
   * Send IP address disabled notification directly to email (fallback when no Better Auth user exists)
   */
  async notifyIPAddressDisabledByEmail(
    merchantId: string,
    merchantName: string,
    ownerEmail: string,
    ipAddress: string,
    reason?: string,
  ) {
    try {
      // Get email template
      const emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
        where: {
          name: 'ip-address-disabled',
          isActive: true,
        },
      });

      if (!emailTemplate) {
        this.logger.warn(
          `Email template 'ip-address-disabled' not found or inactive`,
        );
        // Send a basic email without template
        const subject = 'IP Address Disabled - FetanPay';
        const content = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="margin-bottom: 12px;">IP Address Disabled</h2>
            <p>Dear ${merchantName},</p>
            <p>Your IP address <strong>${ipAddress}</strong> has been disabled by an administrator.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>This may affect your API access. Please contact support if you need assistance.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #475569; font-size: 14px;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        `;

        await this.emailService.sendNotificationEmail(
          ownerEmail,
          subject,
          content,
        );

        this.logger.log(
          `IP address disabled email sent directly to ${ownerEmail}`,
        );
        return;
      }

      const variables = {
        merchantName,
        ipAddress,
        reason: reason || 'No specific reason provided',
      };
      const subject = this.substituteVariables(
        emailTemplate.subject,
        variables,
      );
      const content = this.substituteVariables(
        emailTemplate.content,
        variables,
      );

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: ownerEmail,
          subject,
          content,
          templateId: emailTemplate.id,
          merchantId: merchantId,
          sentByUserId: 'system',
          status: 'PENDING',
        },
      });

      // Send email directly
      await this.emailService.sendNotificationEmail(
        ownerEmail,
        subject,
        content,
      );

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(
        `IP address disabled email sent directly to ${ownerEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send IP address disabled email to ${ownerEmail}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Notify merchant about IP address being enabled by admin
   */
  async notifyIPAddressEnabled(
    merchantId: string,
    merchantName: string,
    ownerUserId: string,
    ipAddress: string,
  ) {
    await this.createNotification({
      userId: ownerUserId,
      userType: 'MERCHANT_USER',
      merchantId,
      type: 'IP_ADDRESS_ENABLED',
      title: 'IP Address Enabled',
      message: `Your IP address ${ipAddress} has been enabled by an administrator. You can now make API requests from this IP address.`,
      priority: 'MEDIUM',
      data: { merchantId, merchantName, ipAddress },
      sendEmail: true,
      emailTemplate: 'ip-address-enabled',
      emailVariables: {
        merchantName,
        ipAddress,
      },
    });
  }

  /**
   * Send IP address enabled notification directly to email (fallback when no Better Auth user exists)
   */
  async notifyIPAddressEnabledByEmail(
    merchantId: string,
    merchantName: string,
    ownerEmail: string,
    ipAddress: string,
  ) {
    try {
      // Get email template
      const emailTemplate = await (this.prisma as any).emailTemplate.findFirst({
        where: {
          name: 'ip-address-enabled',
          isActive: true,
        },
      });

      if (!emailTemplate) {
        this.logger.warn(
          `Email template 'ip-address-enabled' not found or inactive`,
        );
        // Send a basic email without template
        const subject = 'IP Address Enabled - FetanPay';
        const content = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="margin-bottom: 12px;">IP Address Enabled</h2>
            <p>Dear ${merchantName},</p>
            <p>Your IP address <strong>${ipAddress}</strong> has been enabled by an administrator.</p>
            <p>You can now make API requests from this IP address.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #475569; font-size: 14px;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        `;

        await this.emailService.sendNotificationEmail(
          ownerEmail,
          subject,
          content,
        );

        this.logger.log(
          `IP address enabled email sent directly to ${ownerEmail}`,
        );
        return;
      }

      const variables = {
        merchantName,
        ipAddress,
      };
      const subject = this.substituteVariables(
        emailTemplate.subject,
        variables,
      );
      const content = this.substituteVariables(
        emailTemplate.content,
        variables,
      );

      // Create email log entry
      const emailLog = await (this.prisma as any).emailLog.create({
        data: {
          toEmail: ownerEmail,
          subject,
          content,
          templateId: emailTemplate.id,
          merchantId: merchantId,
          sentByUserId: 'system',
          status: 'PENDING',
        },
      });

      // Send email directly
      await this.emailService.sendNotificationEmail(
        ownerEmail,
        subject,
        content,
      );

      // Update email log status
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(
        `IP address enabled email sent directly to ${ownerEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send IP address enabled email to ${ownerEmail}: ${error.message}`,
        error.stack,
      );
    }
  }
}
