import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { MerchantUsersService } from '../merchant-users/merchant-users.service';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantUsersService: MerchantUsersService,
  ) {}

  /**
   * Generate a new API key
   * Format: fetan_live_sk_<random_64_chars>
   */
  private generateApiKey(): { key: string; prefix: string; hash: string } {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const key = `fetan_live_sk_${randomBytes}`;
    const prefix = key.substring(0, 20); // First 20 chars for display
    const hash = crypto.createHash('sha256').update(key).digest('hex');

    return { key, prefix, hash };
  }

  /**
   * Hash an API key for comparison
   */
  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Get merchant ID from request (for session-based auth)
   */
  private async getMerchantIdFromRequest(req: Request): Promise<string> {
    const membership = await this.merchantUsersService.me(req);
    const membershipData = membership as any;
    const merchantId = membershipData.membership?.merchant?.id;

    if (!merchantId) {
      throw new ForbiddenException('Merchant membership required');
    }

    return merchantId;
  }

  /**
   * Create a new API key
   */
  async createApiKey(dto: CreateApiKeyDto, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    // Get merchant user ID who is creating the key
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
        'Merchant must be active to create API keys',
      );
    }

    // Generate API key
    const { key, prefix, hash } = this.generateApiKey();

    // Parse expiration date if provided
    let expiresAt: Date | null = null;
    if (dto.expiresAt) {
      expiresAt = new Date(dto.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        throw new BadRequestException('Invalid expiration date');
      }
      if (expiresAt <= new Date()) {
        throw new BadRequestException('Expiration date must be in the future');
      }
    }

    // Default scopes if not provided
    const scopes =
      dto.scopes && dto.scopes.length > 0
        ? dto.scopes
        : ['payments:verify', 'payments:read'];

    // Create API key in database
    const apiKey = await this.prisma.apiKey.create({
      data: {
        merchantId,
        name: dto.name,
        keyHash: hash,
        keyPrefix: prefix,
        expiresAt,
        scopes,
        createdBy: merchantUserId || null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        expiresAt: true,
        scopes: true,
        createdAt: true,
      },
    });

    // Return the key only once (never stored in DB)
    return {
      ...apiKey,
      key, // Include the plain key only on creation
      warning: 'Store this key securely. It will not be shown again.',
    };
  }

  /**
   * List all API keys for a merchant
   */
  async listApiKeys(req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const apiKeys = await this.prisma.apiKey.findMany({
      where: { merchantId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        expiresAt: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys;
  }

  /**
   * Get API key details
   */
  async getApiKey(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        merchantId, // Ensure merchant owns this key
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        expiresAt: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.status === 'REVOKED') {
      throw new BadRequestException('API key is already revoked');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    return { message: 'API key revoked successfully' };
  }

  /**
   * Extract client IP address from request
   */
  private getClientIP(req: Request): string {
    // Check various headers for the real IP address
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const cfConnectingIP = req.headers['cf-connecting-ip'] as string;

    if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Fallback to socket remote address
    const socketIP = req.socket.remoteAddress || 'unknown';

    // Convert IPv6 localhost to IPv4 localhost for consistency
    if (socketIP === '::1') {
      return '127.0.0.1';
    }

    // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
    if (socketIP.startsWith('::ffff:')) {
      return socketIP.substring(7);
    }

    return socketIP;
  }

  /**
   * Simple IP range checking function
   */
  private isIPInRange(ip: string, range: string): boolean {
    if (range.includes('/')) {
      // CIDR notation
      const [rangeIP, prefixLength] = range.split('/');
      const prefix = parseInt(prefixLength, 10);

      // Convert IP addresses to integers for comparison
      const ipToInt = (ipStr: string) => {
        return (
          ipStr
            .split('.')
            .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
        );
      };

      const ipInt = ipToInt(ip);
      const rangeInt = ipToInt(rangeIP);
      const mask = (0xffffffff << (32 - prefix)) >>> 0;

      return (ipInt & mask) === (rangeInt & mask);
    } else {
      // Exact match
      return ip === range;
    }
  }

  /**
   * Check if an IP address is allowed for a merchant
   */
  private async isIPAllowed(
    merchantId: string,
    clientIP: string,
  ): Promise<boolean> {
    try {
      // Get merchant's IP whitelist settings
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
        select: {
          ipWhitelistEnabled: true,
        },
      });

      if (!merchant) {
        return false;
      }

      // If IP whitelisting is not enabled, allow all IPs
      if (!merchant.ipWhitelistEnabled) {
        return true;
      }

      // Get IP addresses for this merchant
      const ipAddresses = await this.prisma.ipAddress.findMany({
        where: {
          merchantId,
          status: 'ACTIVE',
        },
      });

      // If no IP addresses are configured, deny access
      if (!ipAddresses || ipAddresses.length === 0) {
        return false;
      }

      // Check if client IP matches any of the allowed IPs/ranges
      for (const allowedIP of ipAddresses) {
        try {
          if (this.isIPInRange(clientIP, allowedIP.ipAddress)) {
            return true;
          }
        } catch (error) {
          // If IP range check fails, try exact match
          if (clientIP === allowedIP.ipAddress) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      // If there's any error with IP checking, allow the request
      // This ensures backward compatibility
      return true;
    }
  }
  /**
   * Validate API key and return merchant info
   * Used by API key guard
   */
  async validateApiKey(
    key: string,
    req?: Request,
  ): Promise<{
    merchantId: string;
    apiKeyId: string;
    scopes: string[];
  }> {
    const hash = this.hashApiKey(key);

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash: hash },
      include: {
        merchant: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new ForbiddenException('Invalid API key');
    }

    // Check if revoked
    if (apiKey.status === 'REVOKED') {
      throw new ForbiddenException('API key has been revoked');
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new ForbiddenException('API key has expired');
    }

    // Check if merchant is active
    if (apiKey.merchant.status !== 'ACTIVE') {
      throw new ForbiddenException('Merchant account is not active');
    }

    // Check IP whitelisting if request is provided
    if (req) {
      const clientIP = this.getClientIP(req);
      const isAllowed = await this.isIPAllowed(apiKey.merchantId, clientIP);

      if (!isAllowed) {
        let errorMessage: string;

        // If the request is coming from localhost, guide user to add their public IP
        if (clientIP === '127.0.0.1' || clientIP === '::1') {
          errorMessage = `Your request is coming from localhost (${clientIP}). For security, please add your actual public IP address to the whitelist instead. You can find your public IP at https://whatismyipaddress.com or by running 'curl https://api.ipify.org' in your terminal. Then go to the dashboard → webhook page → IP Address Whitelisting to add your public IP.`;
        } else {
          errorMessage = `Your IP address (${clientIP}) is not whitelisted. Please go to the dashboard and open the webhook page and on the IP Address Whitelisting add your IP address: ${clientIP}`;
        }

        throw new ForbiddenException(errorMessage);
      }
    }

    // Update last used timestamp
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      merchantId: apiKey.merchantId,
      apiKeyId: apiKey.id,
      scopes: apiKey.scopes,
    };
  }
}
