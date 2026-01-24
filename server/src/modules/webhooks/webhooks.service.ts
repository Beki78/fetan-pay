import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import type { Request } from 'express';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { MerchantUsersService } from '../merchant-users/merchant-users.service';
import { encrypt, decrypt } from '../../common/encryption.util';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantUsersService: MerchantUsersService,
  ) {}

  /**
   * Get merchant ID from request (for session-based auth)
   */
  private async getMerchantIdFromRequest(req: Request): Promise<string> {
    const membership = await this.merchantUsersService.me(req);
    const membershipData = membership as any;
    const merchantId = membershipData.membership?.merchant?.id;

    if (!merchantId) {
      throw new BadRequestException('Merchant membership required');
    }

    return merchantId;
  }

  /**
   * Generate a webhook secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Create a new webhook
   */
  async createWebhook(dto: CreateWebhookDto, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    // Get merchant user ID who is creating the webhook
    const membership = await this.merchantUsersService.me(req);
    const membershipData = membership as any;
    const merchantUserId = membershipData.membership?.id;

    // Check if merchant exists and is active
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { status: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    if (merchant.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Merchant must be active to create webhooks',
      );
    }

    // Generate webhook secret
    const secret = this.generateSecret();
    // Encrypt secret for storage
    const encryptedSecret = encrypt(secret);

    // Create webhook
    const webhook = await this.prisma.webhook.create({
      data: {
        merchantId,
        url: dto.url,
        secret: encryptedSecret, // Store encrypted
        events: dto.events,
        maxRetries: dto.maxRetries ?? 3,
        timeout: dto.timeout ?? 30000,
        status: 'ACTIVE',
        createdBy: merchantUserId || null,
      },
      select: {
        id: true,
        url: true,
        events: true,
        status: true,
        maxRetries: true,
        timeout: true,
        successCount: true,
        failureCount: true,
        lastTriggeredAt: true,
        createdAt: true,
        // Don't select secret from DB as it is encrypted
      },
    });

    return {
      ...webhook,
      secret, // Return plain secret
      warning: 'Store this secret securely. It will not be shown again.',
    };
  }

  /**
   * List all webhooks for a merchant
   */
  async listWebhooks(req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const webhooks = await this.prisma.webhook.findMany({
      where: { merchantId },
      select: {
        id: true,
        url: true,
        events: true,
        status: true,
        maxRetries: true,
        timeout: true,
        successCount: true,
        failureCount: true,
        lastTriggeredAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't return secret in list
      },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks;
  }

  /**
   * Get webhook details
   */
  async getWebhook(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        merchantId,
      },
      select: {
        id: true,
        url: true,
        events: true,
        status: true,
        maxRetries: true,
        timeout: true,
        successCount: true,
        failureCount: true,
        lastTriggeredAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't return secret
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  /**
   * Update a webhook
   */
  async updateWebhook(id: string, dto: UpdateWebhookDto, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const updated = await this.prisma.webhook.update({
      where: { id },
      data: {
        ...(dto.url && { url: dto.url }),
        ...(dto.events && { events: dto.events }),
        ...(dto.status && { status: dto.status }),
        ...(dto.maxRetries !== undefined && { maxRetries: dto.maxRetries }),
        ...(dto.timeout !== undefined && { timeout: dto.timeout }),
      },
      select: {
        id: true,
        url: true,
        events: true,
        status: true,
        maxRetries: true,
        timeout: true,
        successCount: true,
        failureCount: true,
        lastTriggeredAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Regenerate webhook secret
   */
  async regenerateSecret(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    // Generate new secret
    const newSecret = this.generateSecret();
    const encryptedSecret = encrypt(newSecret);

    // Update webhook with new secret
    const updated = await this.prisma.webhook.update({
      where: { id },
      data: {
        secret: encryptedSecret,
      },
      select: {
        id: true,
        url: true,
        events: true,
        status: true,
        maxRetries: true,
        timeout: true,
        successCount: true,
        failureCount: true,
        lastTriggeredAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't select secret
      },
    });

    return {
      ...updated,
      secret: newSecret, // Return plain secret
      warning: 'Store this new secret securely. It will not be shown again.',
    };
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({
      where: { id },
    });

    return { message: 'Webhook deleted successfully' };
  }

  /**
   * Test a webhook (send a test event)
   */
  async testWebhook(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    if (webhook.status !== 'ACTIVE') {
      throw new BadRequestException('Webhook must be active to test');
    }

    // Send test event
    const testPayload = {
      id: `evt_test_${Date.now()}`,
      type: 'test',
      created: Math.floor(Date.now() / 1000),
      data: {
        message: 'This is a test webhook event',
        timestamp: new Date().toISOString(),
      },
    };

    // deliverWebhook handles decryption internally
    await this.deliverWebhook(webhook.id, 'test', testPayload);

    return { message: 'Test webhook sent successfully' };
  }

  /**
   * Get webhook delivery logs
   */
  async getDeliveryLogs(webhookId: string, req: Request, limit = 50) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    // Verify webhook belongs to merchant
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id: webhookId,
        merchantId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const deliveries = await this.prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        event: true,
        status: true,
        statusCode: true,
        errorMessage: true,
        attemptNumber: true,
        createdAt: true,
        deliveredAt: true,
        // Don't return full payload in list
      },
    });

    return deliveries;
  }

  /**
   * Trigger webhooks for an event
   * This is called by other services (payments, wallet) when events occur
   */
  async triggerWebhook(
    eventType: string,
    merchantId: string,
    data: any,
  ): Promise<void> {
    // Find all active webhooks for this merchant subscribed to this event
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        merchantId,
        status: 'ACTIVE',
        events: {
          has: eventType,
        },
      },
    });

    if (webhooks.length === 0) {
      this.logger.debug(
        `No active webhooks found for event ${eventType} and merchant ${merchantId}`,
      );
      return;
    }

    // Create payload
    const payload = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: eventType,
      created: Math.floor(Date.now() / 1000),
      data,
    };

    // Deliver to all matching webhooks
    const deliveryPromises = webhooks.map((webhook) =>
      this.deliverWebhook(webhook.id, eventType, payload),
    );

    // Don't await - fire and forget (deliveries are async)
    Promise.allSettled(deliveryPromises).catch((error) => {
      this.logger.error(
        `Error triggering webhooks for event ${eventType}:`,
        error,
      );
    });
  }

  /**
   * Deliver a webhook (send HTTP request)
   */
  private async deliverWebhook(
    webhookId: string,
    eventType: string,
    payload: any,
  ): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.status !== 'ACTIVE') {
      return;
    }

    const payloadString = JSON.stringify(payload);
    
    // Decrypt secret for signature generation
    const secret = decrypt(webhook.secret);
    
    const signature = this.generateSignature(payloadString, secret);

    // Create delivery record
    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event: eventType,
        payload: payload as any,
        status: 'PENDING',
        attemptNumber: 1,
      },
    });

    // Update webhook last triggered
    await this.prisma.webhook.update({
      where: { id: webhook.id },
      data: { lastTriggeredAt: new Date() },
    });

    try {
      // Send HTTP request
      const response = await this.sendHttpRequest(
        webhook.url,
        {
          'Content-Type': 'application/json',
          'X-FetanPay-Signature': signature,
          'X-FetanPay-Event': eventType,
          'X-FetanPay-Delivery-Id': delivery.id,
        },
        payloadString,
        webhook.timeout,
      );

      // Update delivery record
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status:
            response.statusCode >= 200 && response.statusCode < 300
              ? 'SUCCESS'
              : 'FAILED',
          statusCode: response.statusCode,
          responseBody: response.body?.substring(0, 1000), // Limit response body size
          deliveredAt: new Date(),
        },
      });

      // Update webhook statistics
      await this.prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          successCount: {
            increment:
              response.statusCode >= 200 && response.statusCode < 300 ? 1 : 0,
          },
          failureCount: {
            increment:
              response.statusCode >= 200 && response.statusCode < 300 ? 0 : 1,
          },
        },
      });

      // If failed and retries remaining, schedule retry
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (delivery.attemptNumber < webhook.maxRetries) {
          const retryDelay = this.calculateRetryDelay(delivery.attemptNumber);
          await this.prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
              nextRetryAt: new Date(Date.now() + retryDelay),
            },
          });
        } else {
          // Mark webhook as failed if max retries reached
          await this.prisma.webhook.update({
            where: { id: webhook.id },
            data: { status: 'FAILED' },
          });
        }
      }
    } catch (error: any) {
      this.logger.error(`Error delivering webhook ${webhookId}:`, error);

      // Update delivery record with error
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message?.substring(0, 500),
        },
      });

      // Update webhook statistics
      await this.prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          failureCount: { increment: 1 },
        },
      });

      // Schedule retry if attempts remaining
      if (delivery.attemptNumber < webhook.maxRetries) {
        const retryDelay = this.calculateRetryDelay(delivery.attemptNumber);
        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            nextRetryAt: new Date(Date.now() + retryDelay),
          },
        });
      } else {
        // Mark webhook as failed
        await this.prisma.webhook.update({
          where: { id: webhook.id },
          data: { status: 'FAILED' },
        });
      }
    }
  }

  /**
   * Send HTTP request (supports both HTTP and HTTPS)
   */
  private sendHttpRequest(
    url: string,
    headers: Record<string, string>,
    body: string,
    timeout: number,
  ): Promise<{ statusCode: number; body?: string }> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(body),
        },
        timeout,
      };

      const client = isHttps ? https : http;

      const req = client.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 500,
            body: responseBody,
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(body);
      req.end();
    });
  }

  /**
   * Calculate retry delay (exponential backoff)
   */
  private calculateRetryDelay(attemptNumber: number): number {
    // Retry 1: 1 minute, Retry 2: 5 minutes, Retry 3: 15 minutes
    const delays = [60000, 300000, 900000];
    return delays[attemptNumber - 1] || delays[delays.length - 1];
  }

  /**
   * Retry a failed delivery
   */
  async retryDelivery(webhookId: string, deliveryId: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    // Verify webhook belongs to merchant
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id: webhookId,
        merchantId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const delivery = await this.prisma.webhookDelivery.findFirst({
      where: {
        id: deliveryId,
        webhookId,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status === 'SUCCESS') {
      throw new BadRequestException('Delivery already succeeded');
    }

    if (delivery.attemptNumber >= webhook.maxRetries) {
      throw new BadRequestException('Maximum retry attempts reached');
    }

    // Increment attempt number and retry
    await this.prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        attemptNumber: { increment: 1 },
        status: 'PENDING',
        nextRetryAt: null,
      },
    });

    // Retry delivery
    await this.deliverWebhook(
      webhookId,
      delivery.event,
      delivery.payload as any,
    );

    return { message: 'Delivery retry initiated' };
  }
}

