import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class AdminWebhooksService {
  private readonly logger = new Logger(AdminWebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Get all merchants with their webhook statistics
   */
  async getMerchantsWithWebhookStats(search?: string, status?: string) {
    const whereClause: any = {};

    // Apply search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply status filter
    if (status && status !== 'All') {
      whereClause.status = status.toUpperCase();
    }

    const merchants = await this.prisma.merchant.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        contactEmail: true,
        status: true,
        createdAt: true,
        ipWhitelistEnabled: true,
        webhooks: {
          select: {
            id: true,
            url: true,
            status: true,
            successCount: true,
            failureCount: true,
            lastTriggeredAt: true,
          },
        },
        ipAddresses: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            ipAddress: true,
          },
        },
        // Get recent API key usage for request statistics
        apiKeys: {
          where: { status: 'ACTIVE' },
          select: {
            lastUsedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data to match frontend expectations
    const transformedMerchants = await Promise.all(
      merchants.map(async (merchant) => {
        // Calculate webhook statistics
        const totalSuccessful = merchant.webhooks.reduce(
          (sum, webhook) => sum + webhook.successCount,
          0,
        );
        const totalFailed = merchant.webhooks.reduce(
          (sum, webhook) => sum + webhook.failureCount,
          0,
        );
        const totalRequests = totalSuccessful + totalFailed;

        // Get the most recent webhook trigger
        const lastDelivery = merchant.webhooks
          .filter((w) => w.lastTriggeredAt)
          .sort(
            (a, b) =>
              new Date(b.lastTriggeredAt!).getTime() -
              new Date(a.lastTriggeredAt!).getTime(),
          )[0]?.lastTriggeredAt;

        // Determine overall webhook status
        const hasActiveWebhooks = merchant.webhooks.some(
          (w) => w.status === 'ACTIVE',
        );
        const webhookStatus =
          merchant.webhooks.length === 0
            ? 'Inactive'
            : hasActiveWebhooks
              ? 'Active'
              : 'Inactive';

        return {
          id: merchant.id,
          merchantName: merchant.name,
          merchantEmail: merchant.contactEmail,
          webhookUrl: merchant.webhooks[0]?.url || null,
          status: webhookStatus,
          webhooksCount: merchant.webhooks.length,
          ipAddresses: merchant.ipAddresses.map((ip) => ip.ipAddress),
          lastDelivery: lastDelivery,
          successfulDeliveries: totalSuccessful,
          failedDeliveries: totalFailed,
          createdAt: merchant.createdAt,
        };
      }),
    );

    return transformedMerchants;
  }

  /**
   * Get detailed webhook information for a specific merchant
   */
  async getMerchantWebhookDetails(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        status: true,
        ipWhitelistEnabled: true,
        webhooks: {
          select: {
            id: true,
            url: true,
            status: true,
            events: true,
            successCount: true,
            failureCount: true,
            lastTriggeredAt: true,
            createdAt: true,
          },
        },
        ipAddresses: {
          select: {
            id: true,
            ipAddress: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Calculate statistics
    const totalSuccessful = merchant.webhooks.reduce(
      (sum, webhook) => sum + webhook.successCount,
      0,
    );
    const totalFailed = merchant.webhooks.reduce(
      (sum, webhook) => sum + webhook.failureCount,
      0,
    );
    const totalRequests = totalSuccessful + totalFailed;

    // Get recent API usage statistics (mock for now - would need API request logging)
    const stats = {
      totalRequests,
      successfulRequests: totalSuccessful,
      failedRequests: totalFailed,
      totalIpAddresses: merchant.ipAddresses.length, // Show all IPs, not just active ones
    };

    return {
      id: merchant.id,
      merchantName: merchant.name,
      merchantEmail: merchant.contactEmail,
      webhookUrl: merchant.webhooks[0]?.url || null,
      status: merchant.status === 'ACTIVE' ? 'Active' : 'Inactive',
      stats,
      ipAddresses: merchant.ipAddresses.map((ip) => ({
        id: ip.id,
        ipAddress: ip.ipAddress,
        description: ip.description,
        status: ip.status,
        createdAt: ip.createdAt,
        lastUsed: ip.updatedAt, // Using updatedAt as proxy for lastUsed
      })),
    };
  }

  /**
   * Get IP addresses for a merchant
   */
  async getMerchantIPAddresses(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const ipAddresses = await this.prisma.ipAddress.findMany({
      where: { merchantId },
      select: {
        id: true,
        ipAddress: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ipAddresses;
  }

  /**
   * Disable an IP address for a merchant
   */
  async disableIPAddress(merchantId: string, ipId: string) {
    // Verify merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        users: {
          select: {
            userId: true,
            email: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Verify IP address exists and belongs to merchant
    const ipAddress = await this.prisma.ipAddress.findFirst({
      where: {
        id: ipId,
        merchantId,
      },
    });

    if (!ipAddress) {
      throw new NotFoundException('IP address not found');
    }

    // Update IP address status to INACTIVE
    const updatedIP = await this.prisma.ipAddress.update({
      where: { id: ipId },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        ipAddress: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send notifications to merchant owner about IP address being disabled
    try {
      const ownerUser = merchant.users.find((u) => u.userId);
      if (ownerUser?.userId) {
        await this.notificationService.notifyIPAddressDisabled(
          merchantId,
          merchant.name,
          ownerUser.userId,
          ipAddress.ipAddress,
          'Disabled by administrator for security reasons',
        );
      } else {
        // If no userId found, try to find by email and send notification
        const ownerWithEmail = merchant.users.find((u) => u.email);
        if (ownerWithEmail?.email) {
          this.logger.log(
            `No Better Auth user found for merchant ${merchantId}, sending IP disabled notification directly to email: ${ownerWithEmail.email}`,
          );
          await this.notificationService.notifyIPAddressDisabledByEmail(
            merchantId,
            merchant.name,
            ownerWithEmail.email,
            ipAddress.ipAddress,
            'Disabled by administrator for security reasons',
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to send IP address disabled notification:',
        error,
      );
      // Don't fail the disable operation if notification fails
    }

    return {
      message: 'IP address disabled successfully',
      ipAddress: updatedIP,
    };
  }

  /**
   * Enable an IP address for a merchant
   */
  async enableIPAddress(merchantId: string, ipId: string) {
    // Verify merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        users: {
          select: {
            userId: true,
            email: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Verify IP address exists and belongs to merchant
    const ipAddress = await this.prisma.ipAddress.findFirst({
      where: {
        id: ipId,
        merchantId,
      },
    });

    if (!ipAddress) {
      throw new NotFoundException('IP address not found');
    }

    // Update IP address status to ACTIVE
    const updatedIP = await this.prisma.ipAddress.update({
      where: { id: ipId },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        ipAddress: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send notifications to merchant owner about IP address being enabled
    try {
      const ownerUser = merchant.users.find((u) => u.userId);
      if (ownerUser?.userId) {
        await this.notificationService.notifyIPAddressEnabled(
          merchantId,
          merchant.name,
          ownerUser.userId,
          ipAddress.ipAddress,
        );
      } else {
        // If no userId found, try to find by email and send notification
        const ownerWithEmail = merchant.users.find((u) => u.email);
        if (ownerWithEmail?.email) {
          this.logger.log(
            `No Better Auth user found for merchant ${merchantId}, sending IP enabled notification directly to email: ${ownerWithEmail.email}`,
          );
          await this.notificationService.notifyIPAddressEnabledByEmail(
            merchantId,
            merchant.name,
            ownerWithEmail.email,
            ipAddress.ipAddress,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to send IP address enabled notification:',
        error,
      );
      // Don't fail the enable operation if notification fails
    }

    return {
      message: 'IP address enabled successfully',
      ipAddress: updatedIP,
    };
  }

  /**
   * Get API request logs for a merchant (mock implementation)
   * In a real implementation, this would query an API request log table
   */
  async getMerchantRequestLogs(
    merchantId: string,
    limit = 50,
    status?: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, name: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // For now, we'll generate mock data based on webhook deliveries and API key usage
    // In a real implementation, you would have an API request log table
    const webhookDeliveries = await this.prisma.webhookDelivery.findMany({
      where: {
        webhook: {
          merchantId,
        },
      },
      select: {
        id: true,
        event: true,
        status: true,
        statusCode: true,
        errorMessage: true,
        createdAt: true,
        deliveredAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Transform webhook deliveries to look like API request logs
    const requestLogs = webhookDeliveries.map((delivery, index) => ({
      id: `log_${delivery.id}`,
      timestamp: delivery.createdAt,
      ipAddress: `192.168.1.${100 + (index % 50)}`, // Mock IP addresses
      method: 'POST',
      endpoint: '/api/v1/payments/verify',
      status: delivery.status === 'SUCCESS' ? 'Success' : 'Failed',
      responseTime:
        delivery.status === 'SUCCESS'
          ? Math.floor(Math.random() * 300) + 100
          : 0,
      userAgent: `${merchant.name}-API/1.${Math.floor(Math.random() * 5)}.0`,
      errorMessage: delivery.errorMessage,
    }));

    // Filter by status if provided
    const filteredLogs =
      status && status !== 'All'
        ? requestLogs.filter((log) => log.status === status)
        : requestLogs;

    return filteredLogs;
  }

  /**
   * Get webhook delivery logs for a merchant
   */
  async getMerchantWebhookDeliveries(merchantId: string, limit = 50) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const deliveries = await this.prisma.webhookDelivery.findMany({
      where: {
        webhook: {
          merchantId,
        },
      },
      select: {
        id: true,
        event: true,
        status: true,
        statusCode: true,
        errorMessage: true,
        attemptNumber: true,
        createdAt: true,
        deliveredAt: true,
        webhook: {
          select: {
            url: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return deliveries;
  }

  /**
   * Get overall webhook statistics for admin dashboard
   */
  async getWebhookStats() {
    // Get total merchants (all merchants, not just those with webhooks)
    const totalMerchants = await this.prisma.merchant.count({
      where: { status: 'ACTIVE' },
    });

    // Get total merchants with webhooks
    const totalMerchantsWithWebhooks = await this.prisma.merchant.count({
      where: {
        webhooks: {
          some: {},
        },
      },
    });

    // Get total active webhooks
    const totalActiveWebhooks = await this.prisma.webhook.count({
      where: { status: 'ACTIVE' },
    });

    // Get total webhook deliveries in last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDeliveries = await this.prisma.webhookDelivery.count({
      where: {
        createdAt: {
          gte: last24Hours,
        },
      },
    });

    // Get overall delivery statistics
    const totalDeliveries = await this.prisma.webhookDelivery.count();
    const successfulDeliveries = await this.prisma.webhookDelivery.count({
      where: { status: 'SUCCESS' },
    });
    const failedDeliveries = totalDeliveries - successfulDeliveries;

    const successRate =
      totalDeliveries > 0
        ? ((successfulDeliveries / totalDeliveries) * 100).toFixed(1)
        : '0.0';

    // Get average IPs per merchant
    const totalIpAddresses = await this.prisma.ipAddress.count({
      where: { status: 'ACTIVE' },
    });
    const averageIpsPerMerchant =
      totalMerchantsWithWebhooks > 0
        ? (totalIpAddresses / totalMerchantsWithWebhooks).toFixed(1)
        : '0.0';

    return {
      totalMerchants,
      totalMerchantsWithWebhooks,
      totalActiveWebhooks,
      recentDeliveries,
      successRate: `${successRate}%`,
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      totalIpAddresses,
      averageIpsPerMerchant: parseFloat(averageIpsPerMerchant),
      webhookAdoptionRate:
        totalMerchants > 0
          ? ((totalMerchantsWithWebhooks / totalMerchants) * 100).toFixed(1)
          : '0.0',
    };
  }
}
