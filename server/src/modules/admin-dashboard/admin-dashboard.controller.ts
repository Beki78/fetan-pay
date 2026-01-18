import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';
import { GetAnalyticsDto } from './dto/get-analytics.dto';

@ApiTags('admin-dashboard')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get('analytics')
  @ApiOperation({
    summary: 'Get admin dashboard analytics',
    description:
      'Retrieves comprehensive analytics including user statistics, platform transactions, wallet analytics, transaction breakdowns, and provider usage. Supports optional date range filtering. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userAnalytics: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            totalMerchants: { type: 'number' },
          },
        },
        platformTransactions: {
          type: 'object',
          properties: {
            totalTransactions: { type: 'number' },
            totalVerified: { type: 'number' },
            totalPending: { type: 'number' },
            totalUnsuccessful: { type: 'number' },
          },
        },
        walletAnalytics: {
          type: 'object',
          properties: {
            totalDeposits: { type: 'number' },
          },
        },
        transactionTypeBreakdown: {
          type: 'object',
          properties: {
            qr: { type: 'number' },
            cash: { type: 'number' },
            bank: { type: 'number' },
          },
        },
        transactionStatusBreakdown: {
          type: 'object',
          properties: {
            successful: { type: 'number' },
            failed: { type: 'number' },
            pending: { type: 'number' },
            expired: { type: 'number' },
          },
        },
        providerUsage: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              provider: { type: 'string' },
              count: { type: 'number' },
              isCustom: { type: 'boolean' },
            },
          },
        },
        totalTips: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAnalytics(@Query() query: GetAnalyticsDto, @Req() req: Request) {
    return this.adminDashboardService.getAnalytics(query, req);
  }
}

