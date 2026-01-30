import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MerchantAdminDashboardService } from './merchant-admin-dashboard.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ProtectAdvancedAnalytics } from '../../common/decorators/subscription-protection.decorator';

@ApiTags('merchant-admin-dashboard')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('merchant-admin-dashboard')
export class MerchantAdminDashboardController {
  constructor(
    private readonly dashboardService: MerchantAdminDashboardService,
  ) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics for merchant admin',
    description:
      'Retrieves dashboard statistics including transaction counts, wallet balance, and merchant/owner information for the authenticated merchant admin user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        merchantName: { type: 'string', example: 'ABC Restaurant' },
        ownerName: { type: 'string', example: 'John Doe' },
        metrics: {
          type: 'object',
          properties: {
            totalTransactions: { type: 'number', example: 150 },
            verified: { type: 'number', example: 120 },
            pending: { type: 'number', example: 30 },
            walletBalance: { type: 'number', example: 50000.75 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Merchant membership required',
  })
  async getStats(@Req() req: Request) {
    return this.dashboardService.getDashboardStats(req);
  }

  @Get('analytics/metrics')
  @ApiOperation({
    summary: 'Get analytics metrics for merchant admin',
    description:
      'Retrieves transaction metrics including total transactions, verified count, success rate, and total amount for the authenticated merchant admin user. Can be filtered by time period.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period filter',
    enum: ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year'],
    example: 'Last 30 Days',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTransactions: { type: 'number', example: 150 },
        verified: { type: 'number', example: 120 },
        successRate: { type: 'number', example: 80 },
        totalAmount: { type: 'number', example: 50000.75 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Merchant membership required',
  })
  async getAnalyticsMetrics(
    @Req() req: Request,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getAnalyticsMetrics(req, period);
  }

  @Get('analytics/trend')
  @ApiOperation({
    summary: 'Get transaction trend data for merchant admin',
    description:
      'Retrieves time-series transaction trend data grouped by date for the authenticated merchant admin user. Can be filtered by time period.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period filter',
    enum: ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year'],
    example: 'Last 30 Days',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction trend data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: { type: 'string' },
          example: ['Dec 20', 'Dec 21', 'Dec 22'],
        },
        series: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              data: { type: 'array', items: { type: 'number' } },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Merchant membership required',
  })
  @ApiResponse({
    status: 403,
    description: 'Advanced analytics not available in your current plan',
  })
  @UseGuards(SubscriptionGuard)
  @ProtectAdvancedAnalytics()
  async getStatisticsTrend(
    @Req() req: Request,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getStatisticsTrend(req, period);
  }

  @Get('analytics/status-distribution')
  @ApiOperation({
    summary: 'Get transaction status distribution for merchant admin',
    description:
      'Retrieves transaction status distribution (verified, pending, failed) for the authenticated merchant admin user. Can be filtered by time period.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period filter',
    enum: ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year'],
    example: 'Last 30 Days',
  })
  @ApiResponse({
    status: 200,
    description: 'Status distribution retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        verified: { type: 'number', example: 120 },
        pending: { type: 'number', example: 20 },
        failed: { type: 'number', example: 10 },
        total: { type: 'number', example: 150 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Merchant membership required',
  })
  @ApiResponse({
    status: 403,
    description: 'Advanced analytics not available in your current plan',
  })
  @UseGuards(SubscriptionGuard)
  @ProtectAdvancedAnalytics()
  async getStatusDistribution(
    @Req() req: Request,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getStatusDistribution(req, period);
  }
}
