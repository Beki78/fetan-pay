import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CommunicationsService } from './communications.service';
import { AnalyticsService } from './analytics.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { ListEmailLogsDto } from './dto/list-email-logs.dto';
import { ListSmsLogsDto } from './dto/list-sms-logs.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';
import { GetAudienceCountDto } from './dto/get-audience-count.dto';

@ApiTags('communications')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('communications')
export class CommunicationsController {
  constructor(
    private readonly communicationsService: CommunicationsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('emails/send')
  @ApiOperation({
    summary: 'Send an individual email',
    description: 'Send a single email to a recipient. Supports template variables and merchant context. Requires admin authentication.',
  })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Email log ID' },
        status: { type: 'string', enum: ['SENT'] },
        sentAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or email sending failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Template or merchant not found' })
  async sendEmail(@Body() body: SendEmailDto, @Req() req: Request) {
    return this.communicationsService.sendEmail(body, req);
  }

  @Post('sms/send')
  @ApiOperation({
    summary: 'Send an individual SMS',
    description: 'Send a single SMS to a recipient. Supports template variables and merchant context. HTML templates are converted to plain text. Requires admin authentication.',
  })
  @ApiBody({ type: SendSmsDto })
  @ApiResponse({
    status: 200,
    description: 'SMS sent successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'SMS log ID' },
        status: { type: 'string', example: 'SENT' },
        sentAt: { type: 'string', format: 'date-time' },
        messageId: { type: 'string', description: 'Provider message ID' },
        segmentCount: { type: 'number', description: 'Number of SMS segments' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or SMS service not configured' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Template or merchant not found' })
  async sendSms(@Body() body: SendSmsDto, @Req() req: Request) {
    return this.communicationsService.sendSms(body, req);
  }

  @Get('sms/status')
  @ApiOperation({
    summary: 'Get SMS service status',
    description: 'Check if SMS service is configured and working. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'SMS service status',
    schema: {
      type: 'object',
      properties: {
        configured: { type: 'boolean' },
        defaultSender: { type: 'string' },
        defaultFrom: { type: 'string' },
        apiUrl: { type: 'string' },
        tokenConfigured: { type: 'boolean' },
        tokenLength: { type: 'number' },
      },
    },
  })
  async getSmsStatus(@Req() req: Request) {
    return this.communicationsService.getSmsStatus(req);
  }

  @Get('sms/validate')
  @ApiOperation({
    summary: 'Validate SMS service configuration',
    description: 'Test SMS service configuration without sending actual SMS. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'SMS service validation result',
  })
  async validateSmsConfig(@Req() req: Request) {
    return this.communicationsService.validateSmsConfig(req);
  }

  @Get('sms/logs')
  @ApiOperation({
    summary: 'List SMS logs with pagination and filtering',
    description: 'Retrieve SMS sending history with filtering options. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'SMS logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              toPhone: { type: 'string' },
              message: { type: 'string' },
              status: { type: 'string' },
              sentAt: { type: 'string', format: 'date-time', nullable: true },
              segmentCount: { type: 'number' },
              messageId: { type: 'string', nullable: true },
              template: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  category: { type: 'string' },
                },
              },
              merchant: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listSmsLogs(@Query() query: ListSmsLogsDto, @Req() req: Request) {
    return this.communicationsService.listSmsLogs(query, req);
  }

  @Get('test-prisma')
  @ApiOperation({
    summary: 'Test Prisma SMS log access',
    description: 'Test if Prisma can access SMS log table. Requires admin authentication.',
  })
  async testPrismaAccess(@Req() req: Request) {
    return this.communicationsService.testPrismaAccess(req);
  }

  @Post('templates')
  @ApiOperation({
    summary: 'Create a new email template',
    description: 'Create a reusable email template with variables. Requires admin authentication.',
  })
  @ApiBody({ type: CreateEmailTemplateDto })
  @ApiResponse({
    status: 201,
    description: 'Email template created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createEmailTemplate(@Body() body: CreateEmailTemplateDto, @Req() req: Request) {
    return this.communicationsService.createEmailTemplate(body, req);
  }

  @Get('templates')
  @ApiOperation({
    summary: 'List all email templates',
    description: 'Retrieve all email templates. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email templates retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          subject: { type: 'string' },
          content: { type: 'string' },
          variables: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
          usageCount: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listEmailTemplates(@Req() req: Request) {
    return this.communicationsService.listEmailTemplates(req);
  }

  @Get('templates/:id')
  @ApiOperation({
    summary: 'Get email template by ID',
    description: 'Retrieve a specific email template. Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Email template ID',
    example: 'uuid-template-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Email template retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Email template not found' })
  async getEmailTemplate(@Param('id') id: string, @Req() req: Request) {
    return this.communicationsService.getEmailTemplate(id, req);
  }

  @Get('emails/logs')
  @ApiOperation({
    summary: 'List email logs with pagination and filtering',
    description: 'Retrieve email sending history with filtering options. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              toEmail: { type: 'string' },
              subject: { type: 'string' },
              status: { type: 'string' },
              sentAt: { type: 'string', format: 'date-time', nullable: true },
              template: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  category: { type: 'string' },
                },
              },
              merchant: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listEmailLogs(@Query() query: ListEmailLogsDto, @Req() req: Request) {
    return this.communicationsService.listEmailLogs(query, req);
  }

  // ===== CAMPAIGN ENDPOINTS =====

  @Post('campaigns')
  @ApiOperation({
    summary: 'Create a new email campaign',
    description: 'Create a campaign for bulk email sending. Requires admin authentication.',
  })
  @ApiBody({ type: CreateCampaignDto })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async createCampaign(@Body() body: CreateCampaignDto, @Req() req: Request) {
    return this.communicationsService.createCampaign(body, req);
  }

  @Get('campaigns')
  @ApiOperation({
    summary: 'List all campaigns',
    description: 'Retrieve all campaigns with pagination and filtering. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaigns retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listCampaigns(@Query() query: ListCampaignsDto, @Req() req: Request) {
    return this.communicationsService.listCampaigns(query, req);
  }

  @Get('campaigns/:id')
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Retrieve a specific campaign with details. Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: 'uuid-campaign-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaign(@Param('id') id: string, @Req() req: Request) {
    return this.communicationsService.getCampaign(id, req);
  }

  @Post('campaigns/:id/send')
  @ApiOperation({
    summary: 'Send campaign immediately',
    description: 'Start sending a campaign to all recipients. Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: 'uuid-campaign-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign sending started',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        campaignId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Campaign cannot be sent in current status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async sendCampaign(@Param('id') id: string, @Req() req: Request) {
    return this.communicationsService.sendCampaign(id, req);
  }

  @Patch('campaigns/:id/pause')
  @ApiOperation({
    summary: 'Pause campaign',
    description: 'Pause a currently sending campaign. Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: 'uuid-campaign-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign paused successfully',
  })
  @ApiResponse({ status: 400, description: 'Campaign cannot be paused in current status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async pauseCampaign(@Param('id') id: string, @Req() req: Request) {
    return this.communicationsService.pauseCampaign(id, req);
  }

  @Patch('campaigns/:id/cancel')
  @ApiOperation({
    summary: 'Cancel campaign',
    description: 'Cancel a campaign (draft, scheduled, or paused). Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: 'uuid-campaign-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign cancelled successfully',
  })
  @ApiResponse({ status: 400, description: 'Campaign cannot be cancelled in current status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async cancelCampaign(@Param('id') id: string, @Req() req: Request) {
    return this.communicationsService.cancelCampaign(id, req);
  }

  // ===== AUDIENCE ENDPOINTS =====

  @Post('audience/count')
  @ApiOperation({
    summary: 'Get audience count for a segment',
    description: 'Get the number of recipients for an audience segment. Requires admin authentication.',
  })
  @ApiBody({ type: GetAudienceCountDto })
  @ApiResponse({
    status: 200,
    description: 'Audience count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        segment: { type: 'string' },
        count: { type: 'number' },
        filters: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAudienceCount(@Body() body: GetAudienceCountDto, @Req() req: Request) {
    return this.communicationsService.getAudienceCount(body, req);
  }

  @Post('audience/preview')
  @ApiOperation({
    summary: 'Get audience preview',
    description: 'Get a preview of recipients for an audience segment (first 10). Requires admin authentication.',
  })
  @ApiBody({ type: GetAudienceCountDto })
  @ApiResponse({
    status: 200,
    description: 'Audience preview retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        segment: { type: 'string' },
        count: { type: 'number' },
        preview: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              name: { type: 'string' },
              merchantId: { type: 'string' },
              merchantName: { type: 'string' },
              role: { type: 'string' },
            },
          },
        },
        filters: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAudiencePreview(@Body() body: GetAudienceCountDto, @Req() req: Request) {
    return this.communicationsService.getAudiencePreview(body, req);
  }

  // ===== ANALYTICS ENDPOINTS =====

  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Get overall analytics overview',
    description: 'Get comprehensive analytics overview for the last 30 days. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics overview retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAnalyticsOverview(@Query('days') days: string, @Req() req: Request) {
    // Require admin access
    const user = (req as any).user;
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      throw new Error('Admin access required');
    }

    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getOverallAnalytics(daysNumber);
  }

  @Get('analytics/trends')
  @ApiOperation({
    summary: 'Get engagement trends',
    description: 'Get email engagement trends over time. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Engagement trends retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getEngagementTrends(@Query('days') days: string, @Req() req: Request) {
    // Require admin access
    const user = (req as any).user;
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      throw new Error('Admin access required');
    }

    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getEngagementTrends(daysNumber);
  }

  @Get('analytics/campaigns/top')
  @ApiOperation({
    summary: 'Get top performing campaigns',
    description: 'Get list of top performing campaigns by engagement. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top campaigns retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getTopCampaigns(@Query('limit') limit: string, @Req() req: Request) {
    // Require admin access
    const user = (req as any).user;
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      throw new Error('Admin access required');
    }

    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopPerformingCampaigns(limitNumber);
  }

  @Get('analytics/campaigns/:id')
  @ApiOperation({
    summary: 'Get detailed campaign analytics',
    description: 'Get comprehensive analytics for a specific campaign. Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: 'uuid-campaign-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign analytics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaignAnalytics(@Param('id') id: string, @Req() req: Request) {
    // Require admin access
    const user = (req as any).user;
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      throw new Error('Admin access required');
    }

    return this.analyticsService.getCampaignAnalytics(id);
  }
}