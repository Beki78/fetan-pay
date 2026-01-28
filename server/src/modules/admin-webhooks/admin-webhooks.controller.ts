import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { AdminWebhooksService } from './admin-webhooks.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UpdateIPAddressDto } from '../ip-addresses/dto/update-ip-address.dto';

@ApiTags('admin-webhooks')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/webhooks')
@AllowAnonymous()
@UseGuards(ThrottlerGuard)
export class AdminWebhooksController {
  constructor(private readonly adminWebhooksService: AdminWebhooksService) {}

  @Get('merchants')
  @ApiOperation({
    summary: 'List all merchants with webhook statistics',
    description:
      'Returns all merchants with their webhook configurations and statistics for admin dashboard.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search merchants by name or email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by merchant status (Active, Inactive)',
  })
  @ApiResponse({
    status: 200,
    description: 'Merchants with webhook statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMerchantsWithWebhookStats(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Req() req?: Request,
  ) {
    return this.adminWebhooksService.getMerchantsWithWebhookStats(
      search,
      status,
    );
  }

  @Get('merchants/:merchantId/details')
  @ApiOperation({
    summary: 'Get detailed webhook information for a merchant',
    description:
      'Returns comprehensive webhook details, statistics, IP addresses, and request logs for a specific merchant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Merchant webhook details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMerchantWebhookDetails(@Param('merchantId') merchantId: string) {
    return this.adminWebhooksService.getMerchantWebhookDetails(merchantId);
  }

  @Get('merchants/:merchantId/ip-addresses')
  @ApiOperation({
    summary: 'Get IP addresses for a merchant',
    description: 'Returns all IP addresses configured for a specific merchant.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP addresses retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMerchantIPAddresses(@Param('merchantId') merchantId: string) {
    return this.adminWebhooksService.getMerchantIPAddresses(merchantId);
  }

  @Put('merchants/:merchantId/ip-addresses/:ipId/disable')
  @ApiOperation({
    summary: 'Disable an IP address for a merchant',
    description: 'Disables a specific IP address for a merchant.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP address disabled successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant or IP address not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async disableIPAddress(
    @Param('merchantId') merchantId: string,
    @Param('ipId') ipId: string,
  ) {
    return this.adminWebhooksService.disableIPAddress(merchantId, ipId);
  }

  @Put('merchants/:merchantId/ip-addresses/:ipId/enable')
  @ApiOperation({
    summary: 'Enable an IP address for a merchant',
    description: 'Enables a previously disabled IP address for a merchant.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP address enabled successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant or IP address not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enableIPAddress(
    @Param('merchantId') merchantId: string,
    @Param('ipId') ipId: string,
  ) {
    return this.adminWebhooksService.enableIPAddress(merchantId, ipId);
  }

  @Get('merchants/:merchantId/request-logs')
  @ApiOperation({
    summary: 'Get API request logs for a merchant',
    description: 'Returns recent API request logs for a specific merchant.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of logs to return',
    example: 50,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by request status (Success, Failed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Request logs retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMerchantRequestLogs(
    @Param('merchantId') merchantId: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.adminWebhooksService.getMerchantRequestLogs(
      merchantId,
      limitNum,
      status,
    );
  }

  @Get('merchants/:merchantId/webhook-deliveries')
  @ApiOperation({
    summary: 'Get webhook delivery logs for a merchant',
    description:
      'Returns webhook delivery history for all webhooks of a specific merchant.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of deliveries to return',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook deliveries retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMerchantWebhookDeliveries(
    @Param('merchantId') merchantId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.adminWebhooksService.getMerchantWebhookDeliveries(
      merchantId,
      limitNum,
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get overall webhook statistics',
    description:
      'Returns aggregated webhook statistics for the admin dashboard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWebhookStats() {
    return this.adminWebhooksService.getWebhookStats();
  }
}
