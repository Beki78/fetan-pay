import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiKeyOrSessionGuard } from '../api-keys/guards/api-key-or-session.guard';

@ApiTags('webhooks')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('webhooks')
@AllowAnonymous()
@UseGuards(ApiKeyOrSessionGuard, ThrottlerGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new webhook',
    description:
      'Creates a new webhook endpoint for the authenticated merchant. The secret will be shown only once.',
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createWebhook(@Body() dto: CreateWebhookDto, @Req() req: Request) {
    return this.webhooksService.createWebhook(dto, req);
  }

  @Get()
  @ApiOperation({
    summary: 'List all webhooks',
    description: 'Returns all webhooks for the authenticated merchant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhooks retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listWebhooks(@Req() req: Request) {
    return this.webhooksService.listWebhooks(req);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get webhook details',
    description: 'Returns details for a specific webhook.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWebhook(@Param('id') id: string, @Req() req: Request) {
    return this.webhooksService.getWebhook(id, req);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a webhook',
    description: 'Updates webhook configuration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateWebhook(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
    @Req() req: Request,
  ) {
    return this.webhooksService.updateWebhook(id, dto, req);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a webhook',
    description: 'Deletes a webhook endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteWebhook(@Param('id') id: string, @Req() req: Request) {
    return this.webhooksService.deleteWebhook(id, req);
  }

  @Post(':id/regenerate-secret')
  @ApiOperation({
    summary: 'Regenerate webhook secret',
    description:
      'Generates a new secret for the webhook. The old secret will be invalidated. The new secret will be shown only once.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook secret regenerated successfully',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async regenerateSecret(@Param('id') id: string, @Req() req: Request) {
    return this.webhooksService.regenerateSecret(id, req);
  }

  @Post(':id/test')
  @ApiOperation({
    summary: 'Test a webhook',
    description: 'Sends a test event to the webhook endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Test webhook sent successfully',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async testWebhook(@Param('id') id: string, @Req() req: Request) {
    return this.webhooksService.testWebhook(id, req);
  }

  @Get(':id/deliveries')
  @ApiOperation({
    summary: 'Get webhook delivery logs',
    description: 'Returns delivery history for a webhook.',
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
    description: 'Delivery logs retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeliveryLogs(
    @Param('id') id: string,
    @Query('limit') limit: string | undefined,
    @Req() req: Request,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.webhooksService.getDeliveryLogs(id, req, limitNum);
  }

  @Post(':id/retry/:deliveryId')
  @ApiOperation({
    summary: 'Retry a failed webhook delivery',
    description: 'Retries sending a failed webhook delivery.',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery retry initiated',
  })
  @ApiResponse({ status: 404, description: 'Webhook or delivery not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async retryDelivery(
    @Param('id') id: string,
    @Param('deliveryId') deliveryId: string,
    @Req() req: Request,
  ) {
    return this.webhooksService.retryDelivery(id, deliveryId, req);
  }
}
