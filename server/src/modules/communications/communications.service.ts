import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { AudienceService } from './audience.service';
import { CampaignQueueService } from './campaign-queue.service';
import { SendEmailDto } from './dto/send-email.dto';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { ListEmailLogsDto } from './dto/list-email-logs.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';
import { GetAudienceCountDto } from './dto/get-audience-count.dto';
import type { Request } from 'express';

@Injectable()
export class CommunicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly audienceService: AudienceService,
    private readonly campaignQueueService: CampaignQueueService,
  ) {}

  /**
   * Send an individual email
   */
  async sendEmail(dto: SendEmailDto, req: Request) {
    this.requireAdmin(req);

    const sentByUserId = this.extractUserId(req);
    
    // Validate merchant exists if merchantId provided
    if (dto.merchantId) {
      const merchant = await (this.prisma as any).merchant.findUnique({
        where: { id: dto.merchantId },
      });
      if (!merchant) {
        throw new NotFoundException(`Merchant with ID ${dto.merchantId} not found`);
      }
    }

    // Get template if templateId provided
    let template: any = null;
    if (dto.templateId) {
      template = await (this.prisma as any).emailTemplate.findUnique({
        where: { id: dto.templateId },
      });
      if (!template) {
        throw new NotFoundException(`Email template with ID ${dto.templateId} not found`);
      }
      if (!template.isActive) {
        throw new BadRequestException('Email template is not active');
      }
    }

    // Process template variables
    let finalSubject = dto.subject;
    let finalContent = dto.content;

    if (template && dto.variables) {
      finalSubject = this.substituteVariables(template.subject, dto.variables);
      finalContent = this.substituteVariables(template.content, dto.variables);
    } else if (dto.variables) {
      finalSubject = this.substituteVariables(dto.subject, dto.variables);
      finalContent = this.substituteVariables(dto.content, dto.variables);
    }

    // Create email log entry
    const emailLog = await (this.prisma as any).emailLog.create({
      data: {
        toEmail: dto.toEmail,
        subject: finalSubject,
        content: finalContent,
        templateId: dto.templateId,
        merchantId: dto.merchantId,
        sentByUserId,
        status: 'PENDING',
      },
    });

    try {
      // Send email using existing EmailService
      await this.sendEmailViaProvider(dto.toEmail, finalSubject, finalContent);

      // Update status to SENT
      await (this.prisma as any).emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Increment template usage count
      if (template) {
        await (this.prisma as any).emailTemplate.update({
          where: { id: template.id },
          data: {
            usageCount: { increment: 1 },
          },
        });
      }

      return {
        id: emailLog.id,
        status: 'SENT',
        sentAt: new Date(),
      };
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

      throw new BadRequestException(`Failed to send email: ${(error as Error)?.message}`);
    }
  }

  /**
   * Create a new email template
   */
  async createEmailTemplate(dto: CreateEmailTemplateDto, req: Request) {
    this.requireAdmin(req);

    const template = await (this.prisma as any).emailTemplate.create({
      data: {
        name: dto.name,
        category: dto.category,
        subject: dto.subject,
        content: dto.content,
        variables: dto.variables,
        isActive: dto.isActive ?? true,
      },
    });

    return template;
  }

  /**
   * List email templates
   */
  async listEmailTemplates(req: Request) {
    this.requireAdmin(req);

    const templates = await (this.prisma as any).emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return templates;
  }

  /**
   * Get email template by ID
   */
  async getEmailTemplate(id: string, req: Request) {
    this.requireAdmin(req);

    const template = await (this.prisma as any).emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * List email logs with pagination and filtering
   */
  async listEmailLogs(query: ListEmailLogsDto, req: Request) {
    this.requireAdmin(req);

    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('pageSize must be a positive integer');
    }

    // Build where clause
    const where: any = {};

    if (query.merchantId) {
      where.merchantId = query.merchantId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.templateId) {
      where.templateId = query.templateId;
    }

    if (query.search) {
      where.OR = [
        { toEmail: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }

    // Get total count and data
    const [total, emailLogs] = await Promise.all([
      (this.prisma as any).emailLog.count({ where }),
      (this.prisma as any).emailLog.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: emailLogs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Send email via the existing EmailService (adapted for custom content)
   */
  private async sendEmailViaProvider(toEmail: string, subject: string, htmlContent: string) {
    // We'll extend the existing EmailService or create a custom method
    // For now, we'll use a workaround by calling the transporter directly
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
    
    console.info('[CommunicationsService] Email sent', {
      to: toEmail,
      subject,
      messageId: info.messageId,
    });

    return info;
  }

  /**
   * Substitute template variables in content
   */
  private substituteVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  /**
   * Require admin authentication
   */
  private requireAdmin(req: Request) {
    const user = (req as any).user;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has admin role
    const role = user.role || user.userRole;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(req: Request): string {
    const user = (req as any).user;
    if (!user?.id) {
      throw new ForbiddenException('User ID not found in request');
    }
    return user.id;
  }

  /**
   * Create a new campaign
   */
  async createCampaign(dto: CreateCampaignDto, req: Request) {
    this.requireAdmin(req);

    const createdByUserId = this.extractUserId(req);

    // Validate template exists if templateId provided
    if (dto.templateId) {
      const template = await (this.prisma as any).emailTemplate.findUnique({
        where: { id: dto.templateId },
      });
      if (!template) {
        throw new NotFoundException(`Email template with ID ${dto.templateId} not found`);
      }
      if (!template.isActive) {
        throw new BadRequestException('Email template is not active');
      }
    }

    // Get audience count for estimation
    const targetCount = await this.audienceService.getAudienceCount(
      dto.audienceSegment,
      dto.customFilters
    );

    // Calculate estimated cost (example: $0.001 per email)
    const estimatedCost = targetCount * 0.001;

    // Determine initial status
    const status = dto.scheduledAt ? 'SCHEDULED' : 'DRAFT';

    const campaign = await (this.prisma as any).campaign.create({
      data: {
        name: dto.name,
        type: dto.type,
        status,
        subject: dto.subject,
        content: dto.content,
        templateId: dto.templateId,
        audienceSegment: dto.audienceSegment,
        customFilters: dto.customFilters,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        targetCount,
        estimatedCost,
        createdByUserId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return campaign;
  }

  /**
   * List campaigns with pagination and filtering
   */
  async listCampaigns(query: ListCampaignsDto, req: Request) {
    this.requireAdmin(req);

    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('pageSize must be a positive integer');
    }

    // Build where clause
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }

    // Get total count and data
    const [total, campaigns] = await Promise.all([
      (this.prisma as any).campaign.count({ where }),
      (this.prisma as any).campaign.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: campaigns,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(id: string, req: Request) {
    this.requireAdmin(req);

    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        emailLogs: {
          select: {
            id: true,
            status: true,
            sentAt: true,
            failedAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  /**
   * Send campaign immediately
   */
  async sendCampaign(id: string, req: Request) {
    this.requireAdmin(req);

    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      throw new BadRequestException(`Campaign cannot be sent in current status: ${campaign.status}`);
    }

    // Check if campaign is already being processed
    if (this.campaignQueueService.isCampaignProcessing(id)) {
      throw new BadRequestException('Campaign is already being processed');
    }

    // Start processing campaign asynchronously
    this.campaignQueueService.processCampaign(id).catch(error => {
      console.error(`Failed to process campaign ${id}:`, error);
    });

    return {
      message: 'Campaign sending started',
      campaignId: id,
    };
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(id: string, req: Request) {
    this.requireAdmin(req);

    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    if (campaign.status !== 'SENDING') {
      throw new BadRequestException(`Campaign cannot be paused in current status: ${campaign.status}`);
    }

    await (this.prisma as any).campaign.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    return {
      message: 'Campaign paused',
      campaignId: id,
    };
  }

  /**
   * Cancel campaign
   */
  async cancelCampaign(id: string, req: Request) {
    this.requireAdmin(req);

    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    if (campaign.status === 'SENT' || campaign.status === 'CANCELLED') {
      throw new BadRequestException(`Campaign cannot be cancelled in current status: ${campaign.status}`);
    }

    await (this.prisma as any).campaign.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    return {
      message: 'Campaign cancelled',
      campaignId: id,
    };
  }

  /**
   * Get audience count for a segment
   */
  async getAudienceCount(dto: GetAudienceCountDto, req: Request) {
    this.requireAdmin(req);

    const count = await this.audienceService.getAudienceCount(dto.segment, dto.filters);

    return {
      segment: dto.segment,
      count,
      filters: dto.filters,
    };
  }

  /**
   * Get audience preview (first 10 recipients)
   */
  async getAudiencePreview(dto: GetAudienceCountDto, req: Request) {
    this.requireAdmin(req);

    const [count, recipients] = await Promise.all([
      this.audienceService.getAudienceCount(dto.segment, dto.filters),
      this.audienceService.getAudienceRecipients(dto.segment, dto.filters, 10, 0),
    ]);

    return {
      segment: dto.segment,
      count,
      preview: recipients,
      filters: dto.filters,
    };
  }
}