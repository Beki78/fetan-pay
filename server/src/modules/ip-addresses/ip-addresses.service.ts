import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { Request } from 'express';
import { CreateIPAddressDto } from './dto/create-ip-address.dto';
import { UpdateIPAddressDto } from './dto/update-ip-address.dto';
import { MerchantUsersService } from '../merchant-users/merchant-users.service';

// Simple IP range checking function
function isIPInRange(ip: string, range: string): boolean {
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

@Injectable()
export class IPAddressesService {
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
      throw new ForbiddenException('Merchant membership required');
    }

    return merchantId;
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
   * Validate IP address format
   */
  private validateIPAddress(ip: string): boolean {
    // IPv4 validation
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv4 CIDR validation
    const ipv4CidrRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
    // IPv6 validation (basic)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    // IPv6 CIDR validation (basic)
    const ipv6CidrRegex =
      /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\/(?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;

    return (
      ipv4Regex.test(ip) ||
      ipv4CidrRegex.test(ip) ||
      ipv6Regex.test(ip) ||
      ipv6CidrRegex.test(ip)
    );
  }

  /**
   * Check if an IP address is allowed for a merchant
   */
  async isIPAllowed(merchantId: string, clientIP: string): Promise<boolean> {
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
          if (isIPInRange(clientIP, allowedIP.ipAddress)) {
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
   * Create a new IP address for a merchant
   */
  async createIPAddress(dto: CreateIPAddressDto, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    // Validate IP address format
    if (!this.validateIPAddress(dto.ipAddress)) {
      throw new BadRequestException(
        'Invalid IP address format. Please use IPv4, IPv6, or CIDR notation (e.g., 192.168.1.100 or 192.168.1.0/24)',
      );
    }

    // Check if IP address already exists for this merchant
    const existingIP = await this.prisma.ipAddress.findFirst({
      where: {
        merchantId,
        ipAddress: dto.ipAddress,
      },
    });

    if (existingIP) {
      throw new BadRequestException('This IP address is already added');
    }

    // Create IP address
    const ipAddress = await this.prisma.ipAddress.create({
      data: {
        merchantId,
        ipAddress: dto.ipAddress,
        description: dto.description,
        status: 'ACTIVE',
      },
    });

    return ipAddress;
  }

  /**
   * List all IP addresses for a merchant
   */
  async listIPAddresses(req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const ipAddresses = await this.prisma.ipAddress.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    return ipAddresses;
  }

  /**
   * Get IP address details
   */
  async getIPAddress(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const ipAddress = await this.prisma.ipAddress.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!ipAddress) {
      throw new NotFoundException('IP address not found');
    }

    return ipAddress;
  }

  /**
   * Update an IP address
   */
  async updateIPAddress(id: string, dto: UpdateIPAddressDto, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const ipAddress = await this.prisma.ipAddress.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!ipAddress) {
      throw new NotFoundException('IP address not found');
    }

    // If updating IP address, validate format
    if (dto.ipAddress && !this.validateIPAddress(dto.ipAddress)) {
      throw new BadRequestException(
        'Invalid IP address format. Please use IPv4, IPv6, or CIDR notation (e.g., 192.168.1.100 or 192.168.1.0/24)',
      );
    }

    // Check for duplicates if updating IP address
    if (dto.ipAddress && dto.ipAddress !== ipAddress.ipAddress) {
      const existingIP = await this.prisma.ipAddress.findFirst({
        where: {
          merchantId,
          ipAddress: dto.ipAddress,
          id: { not: id },
        },
      });

      if (existingIP) {
        throw new BadRequestException('This IP address is already added');
      }
    }

    const updatedIPAddress = await this.prisma.ipAddress.update({
      where: { id },
      data: {
        ...(dto.ipAddress && { ipAddress: dto.ipAddress }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
      },
    });

    return updatedIPAddress;
  }

  /**
   * Delete an IP address
   */
  async deleteIPAddress(id: string, req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    const ipAddress = await this.prisma.ipAddress.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!ipAddress) {
      throw new NotFoundException('IP address not found');
    }

    await this.prisma.ipAddress.delete({
      where: { id },
    });

    return { message: 'IP address deleted successfully' };
  }

  /**
   * Enable IP whitelisting for a merchant
   */
  async enableIPWhitelisting(req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    try {
      await this.prisma.merchant.update({
        where: { id: merchantId },
        data: { ipWhitelistEnabled: true },
      });

      return { message: 'IP whitelisting enabled successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to enable IP whitelisting');
    }
  }

  /**
   * Disable IP whitelisting for a merchant
   */
  async disableIPWhitelisting(req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    try {
      await this.prisma.merchant.update({
        where: { id: merchantId },
        data: { ipWhitelistEnabled: false },
      });

      return { message: 'IP whitelisting disabled successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to disable IP whitelisting');
    }
  }

  /**
   * Get IP whitelisting status for a merchant
   */
  async getIPWhitelistingStatus(req: Request) {
    const merchantId = await this.getMerchantIdFromRequest(req);

    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
        select: {
          ipWhitelistEnabled: true,
        },
      });

      if (!merchant) {
        throw new NotFoundException('Merchant not found');
      }

      // Get IP addresses separately (including disabled ones)
      const ipAddresses = await this.prisma.ipAddress.findMany({
        where: {
          merchantId,
        },
        select: {
          id: true,
          ipAddress: true,
          description: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        enabled: merchant.ipWhitelistEnabled || false,
        ipAddresses: ipAddresses || [],
      };
    } catch (error) {
      // Fallback for backward compatibility
      return {
        enabled: false,
        ipAddresses: [],
      };
    }
  }

  /**
   * Get current client IP address
   */
  async getCurrentIP(req: Request) {
    const clientIP = this.getClientIP(req);
    return { ip: clientIP };
  }
}
