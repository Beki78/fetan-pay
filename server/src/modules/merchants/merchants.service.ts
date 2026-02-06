import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { SelfRegisterMerchantDto } from './dto/self-register-merchant.dto';
import {
  AdminCreateMerchantDto,
  MerchantStatusDto,
} from './dto/admin-create-merchant.dto';
import { MerchantQueryDto } from './dto/merchant-query.dto';
import { ApproveMerchantDto } from './dto/approve-merchant.dto';
import { RejectMerchantDto } from './dto/reject-merchant.dto';
import { CreateMerchantUserDto } from './dto/create-merchant-user.dto';
import { UpdateMerchantUserDto } from './dto/update-merchant-user.dto';
import { SetMerchantUserStatusDto } from './dto/set-merchant-user-status.dto';
import { UpdateMerchantProfileDto } from './dto/update-merchant-profile.dto';
import { QrCodeService } from './qr-code.service';
import { auth } from '../../../auth';
import * as CryptoJS from 'crypto-js';
import type { Request } from 'express';

type MerchantStatus = 'PENDING' | 'ACTIVE';
type MerchantUserRole =
  | 'MERCHANT_OWNER'
  | 'ADMIN'
  | 'ACCOUNTANT'
  | 'SALES'
  | 'WAITER';
type MerchantUserStatus = 'INVITED' | 'ACTIVE';

@Injectable()
export class MerchantsService {
  private readonly encryptionKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly qrCodeService: QrCodeService,
    private readonly notificationService: NotificationService,
  ) {
    // Use same encryption key as QR service for password encryption
    this.encryptionKey =
      process.env.QR_CODE_SECRET ||
      process.env.BETTER_AUTH_SECRET ||
      'default-secret-change-in-production';
  }

  async getUser(merchantId: string, merchantUserId: string) {
    const membership = await (this.prisma as any).merchantUser.findFirst({
      where: { id: merchantUserId, merchantId },
    });

    if (!membership) {
      throw new NotFoundException('Merchant user not found');
    }
    return membership;
  }

  async updateUser(
    merchantId: string,
    merchantUserId: string,
    dto: UpdateMerchantUserDto,
  ) {
    // Ensure membership exists + belongs to merchant
    await this.getUser(merchantId, merchantUserId);

    const updated = await (this.prisma as any).merchantUser.update({
      where: { id: merchantUserId },
      data: {
        name: dto.name,
        phone: dto.phone,
        role: dto.role as any,
      },
    });

    return updated;
  }

  async deactivateUser(
    merchantId: string,
    merchantUserId: string,
    _dto: SetMerchantUserStatusDto,
  ) {
    // Note: Banning is handled by the frontend using Better Auth admin API
    // The frontend will call authClient.admin.banUser() directly
    return this.getUser(merchantId, merchantUserId);
  }

  async activateUser(
    merchantId: string,
    merchantUserId: string,
    _dto: SetMerchantUserStatusDto,
  ) {
    const user = await this.getUser(merchantId, merchantUserId);

    // Note: Unbanning is handled by the frontend using Better Auth admin API
    // The frontend will call authClient.admin.unbanUser() directly

    // Ensure MerchantUser status is ACTIVE
    return (this.prisma as any).merchantUser.update({
      where: { id: merchantUserId },
      data: { status: 'ACTIVE' as MerchantUserStatus },
    });
  }

  async selfRegister(dto: SelfRegisterMerchantDto) {
    const existingUser = await this.findAuthUserByEmail(dto.ownerEmail);

    const merchant = await (this.prisma as any).merchant.create({
      data: {
        name: dto.name,
        tin: dto.tin,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        status: 'PENDING', // merchant stays pending until verification/approval
        source: 'self_registered',
        users: {
          create: {
            role: 'MERCHANT_OWNER',
            status: 'INVITED', // owner must complete auth login/verification
            email: dto.ownerEmail,
            phone: dto.ownerPhone,
            name: dto.ownerName,
            userId: existingUser?.id,
          },
        },
      },
      include: { users: true },
    });

    // Send notification to admins about new merchant registration
    try {
      await this.notificationService.notifyMerchantRegistration(
        merchant.id,
        merchant.name,
      );
    } catch (error) {
      console.error(
        'Failed to send merchant registration notification:',
        error,
      );
      // Don't fail the registration if notification fails
    }

    return merchant;
  }

  /**
   * Link Better Auth user to MerchantUser after signup
   * This is called after the user completes Better Auth signup
   */
  async linkUserToMerchant(email: string, userId: string) {
    // Find MerchantUser by email where userId is null or doesn't match
    const merchantUser = await (this.prisma as any).merchantUser.findFirst({
      where: {
        email,
        OR: [{ userId: null }, { userId: { not: userId } }],
      },
    });

    if (!merchantUser) {
      console.log(`No merchant user found for email ${email} to link`);
      return null;
    }

    // Update the MerchantUser with the Better Auth userId
    const updated = await (this.prisma as any).merchantUser.update({
      where: { id: merchantUser.id },
      data: { userId },
    });

    console.log(
      `Linked Better Auth user ${userId} to MerchantUser ${merchantUser.id}`,
    );
    return updated;
  }

  async adminCreate(dto: AdminCreateMerchantDto) {
    const targetStatus = dto.status ?? MerchantStatusDto.ACTIVE;
    const existingUser = await this.findAuthUserByEmail(dto.ownerEmail);

    const merchant = await (this.prisma as any).merchant.create({
      data: {
        name: dto.name,
        tin: dto.tin,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        status: targetStatus as unknown as MerchantStatus,
        source: 'admin_created',
        approvedAt:
          targetStatus === MerchantStatusDto.ACTIVE ? new Date() : undefined,
        users: {
          create: {
            role: 'MERCHANT_OWNER',
            status: 'INVITED',
            email: dto.ownerEmail,
            phone: dto.ownerPhone,
            name: dto.ownerName,
            userId: existingUser?.id,
          },
        },
      },
      include: { users: true },
    });

    return merchant;
  }

  async findOne(id: string) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                banned: true,
              },
            },
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Map users to include banned status and userId from Better Auth user
    const usersWithBanned = merchant.users.map((mu: any) => {
      const { user, ...rest } = mu;
      return {
        ...rest,
        userId: user?.id ?? mu.userId, // Include Better Auth user ID
        banned: user?.banned ?? false,
      };
    });

    return {
      ...merchant,
      users: usersWithBanned,
    };
  }

  async updateProfile(
    merchantId: string,
    dto: UpdateMerchantProfileDto,
    req: Request,
  ) {
    // Verify merchant exists
    const merchant = await this.findOne(merchantId);

    // Get authenticated user from request
    const authUser = (req as any)?.user;
    const authUserId: string | undefined = authUser?.id;

    if (!authUserId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Verify user is a member of this merchant
    const membership = await (this.prisma as any).merchantUser.findFirst({
      where: {
        merchantId,
        userId: authUserId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new UnauthorizedException(
        'You do not have permission to update this merchant profile',
      );
    }

    // Update merchant profile
    const updated = await (this.prisma as any).merchant.update({
      where: { id: merchantId },
      data: {
        name: dto.name,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        tin: dto.tin,
      },
      include: { users: true },
    });

    return updated;
  }

  /**
   * Look up Better Auth user by email. We don’t create auth users here; they must sign up via /api/auth.
   */
  private async findAuthUserByEmail(email?: string | null) {
    if (!email) return null;
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(query: MerchantQueryDto) {
    const page = query.page ? Number(query.page) : 1;
    const pageSize = query.pageSize ? Number(query.pageSize) : 20;
    const where: any = {
      status: query.status as MerchantStatus | undefined,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { tin: { contains: query.search, mode: 'insensitive' } },
            { contactEmail: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [rawData, total] = await this.prisma.$transaction([
      (this.prisma as any).merchant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  banned: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (this.prisma as any).merchant.count({ where }),
    ]);

    // Map merchants to include banned status for users
    const data = rawData.map((merchant: any) => {
      const usersWithBanned = merchant.users.map((mu: any) => {
        const { user, ...rest } = mu;
        return {
          ...rest,
          userId: user?.id ?? mu.userId, // Include Better Auth user ID
          banned: user?.banned ?? false,
        };
      });

      return {
        ...merchant,
        users: usersWithBanned,
      };
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async approve(id: string, dto: ApproveMerchantDto) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: 'MERCHANT_OWNER' },
          select: { userId: true, email: true },
        },
      },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const updated = await (this.prisma as any).merchant.update({
      where: { id },
      data: {
        status: 'ACTIVE' as MerchantStatus,
        approvedAt: new Date(),
        approvedBy: dto.approvedBy,
      },
    });

    // Activate any invited users for this merchant and link them to Better Auth users
    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: { merchantId: id, status: 'INVITED' },
    });

    for (const merchantUser of merchantUsers) {
      // If userId is null, try to find the Better Auth user by email
      let userId = merchantUser.userId;
      if (!userId && merchantUser.email) {
        const authUser = await this.findAuthUserByEmail(merchantUser.email);
        userId = authUser?.id;
      }

      // Update the merchant user to ACTIVE status and link to Better Auth user
      await (this.prisma as any).merchantUser.update({
        where: { id: merchantUser.id },
        data: {
          status: 'ACTIVE' as MerchantUserStatus,
          userId: userId || merchantUser.userId, // Keep existing userId if no match found
        },
      });
    }

    // Send notification to merchant owner about approval
    try {
      const ownerUser = merchant.users.find((u) => u.userId);
      if (ownerUser?.userId) {
        await this.notificationService.notifyMerchantApproval(
          merchant.id,
          merchant.name,
          ownerUser.userId,
        );
      } else {
        // If no userId found, try to find by email and send notification
        const ownerWithEmail = merchant.users.find((u) => u.email);
        if (ownerWithEmail?.email) {
          console.log(
            `Owner userId not found for merchant ${merchant.id}, attempting to find by email: ${ownerWithEmail.email}`,
          );
          const authUser = await this.findAuthUserByEmail(ownerWithEmail.email);
          if (authUser?.id) {
            await this.notificationService.notifyMerchantApproval(
              merchant.id,
              merchant.name,
              authUser.id,
            );
          } else {
            console.log(
              `No Better Auth user found for email ${ownerWithEmail.email}, sending email directly`,
            );
            await this.notificationService.notifyMerchantApprovalByEmail(
              merchant.id,
              merchant.name,
              ownerWithEmail.email,
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send merchant approval notification:', error);
      // Don't fail the approval if notification fails
    }

    // Note: Unbanning users is handled by the frontend using Better Auth admin API
    // The frontend will call authClient.admin.unbanUser() for all team members

    return updated;
  }

  async reject(id: string, dto: RejectMerchantDto) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: 'MERCHANT_OWNER' },
          select: { userId: true, email: true },
        },
      },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const updated = await (this.prisma as any).merchant.update({
      where: { id },
      data: {
        status: 'PENDING' as MerchantStatus,
        approvedAt: null,
        approvedBy: null,
        source: merchant.source,
      },
    });

    // Send notification to merchant owner about rejection
    try {
      const ownerUser = merchant.users.find((u) => u.userId);
      if (ownerUser?.userId) {
        await this.notificationService.notifyMerchantRejection(
          merchant.id,
          merchant.name,
          ownerUser.userId,
          dto.reason,
        );
      } else {
        // If no userId found, try to find by email and send notification
        const ownerWithEmail = merchant.users.find((u) => u.email);
        if (ownerWithEmail?.email) {
          console.log(
            `Owner userId not found for merchant ${merchant.id}, attempting to find by email: ${ownerWithEmail.email}`,
          );
          const authUser = await this.findAuthUserByEmail(ownerWithEmail.email);
          if (authUser?.id) {
            await this.notificationService.notifyMerchantRejection(
              merchant.id,
              merchant.name,
              authUser.id,
              dto.reason,
            );
          } else {
            console.log(
              `No Better Auth user found for email ${ownerWithEmail.email}, sending email directly`,
            );
            await this.notificationService.notifyMerchantRejectionByEmail(
              merchant.id,
              merchant.name,
              ownerWithEmail.email,
              dto.reason,
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send merchant rejection notification:', error);
      // Don't fail the rejection if notification fails
    }

    // Note: Banning users is handled by the frontend using Better Auth admin API
    // The frontend will call authClient.admin.banUser() for all team members

    return updated;
  }

  async createEmployee(
    merchantId: string,
    dto: CreateMerchantUserDto,
    requestHeaders?: Record<string, any>,
  ) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Create Better Auth user via Admin plugin endpoint.
    // NOTE: better-auth exposes server-callable endpoints under `auth.api.*`.
    // The admin plugin does NOT attach an `auth.admin` object.
    let authUserId: string;
    try {
      const api = (auth as any)?.api;
      if (!api?.createUser) {
        throw new Error('Admin user creation not available');
      }

      // Admin endpoints require an authenticated admin session.
      // We don't have that in this backend-to-backend flow, so we create
      // the user through the admin endpoint by providing a server context.
      // In better-auth, endpoints accept a context object with `body` and `headers`.
      const created = await api.createUser({
        body: {
          email: dto.email,
          password: dto.password,
          name: dto.name,
          role: (dto.role as string) || 'EMPLOYEE',
        },
        // Forward caller auth (Cookie / Authorization) so better-auth sees an authenticated admin session.
        // If no caller auth is present, better-auth will correctly respond 401.
        headers: {
          ...(requestHeaders || {}),
          // Ensure IP is always present for rate-limit / auditing middleware.
          'x-forwarded-for':
            (requestHeaders as any)?.['x-forwarded-for'] ||
            (requestHeaders as any)?.['X-Forwarded-For'] ||
            '127.0.0.1',
        },
      });

      authUserId =
        created?.user?.id ||
        created?.data?.user?.id ||
        created?.data?.id ||
        created?.id;

      if (!authUserId) {
        throw new Error('Failed to create auth user for merchant employee');
      }
    } catch (error) {
      // Surface Better Auth errors (often include status/statusCode) so debugging is possible.
      const e = error as any;
      console.error('[createEmployee] better-auth createUser failed', {
        message: e?.message,
        status: e?.status,
        statusCode: e?.statusCode,
        body: e?.body,
      });

      const details =
        e?.body?.message ||
        e?.message ||
        'Failed to create auth user for merchant employee';
      throw new Error(details);
    }

    // Generate QR code token
    const qrCodeToken = this.qrCodeService.generateQRToken();

    // Encrypt and store password temporarily (for QR code login)
    // This is encrypted and will be cleared after first use or after expiry
    const encryptedPassword = CryptoJS.AES.encrypt(
      dto.password,
      this.encryptionKey,
    ).toString();

    const membership = await (this.prisma as any).merchantUser.create({
      data: {
        merchantId,
        userId: authUserId,
        role: (dto.role as MerchantUserRole) || 'EMPLOYEE',
        status: 'ACTIVE' as MerchantUserStatus,
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
        qrCodeToken,
        qrCodeGeneratedAt: new Date(),
        encryptedPassword, // Store encrypted password for QR login
      },
    });

    return membership;
  }

  async listUsers(merchantId: string) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const users = await (this.prisma as any).merchantUser.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  /**
   * Generate or regenerate QR code for a merchant user
   */
  async generateQRCode(merchantId: string, userId: string) {
    const user = await (this.prisma as any).merchantUser.findFirst({
      where: {
        id: userId,
        merchantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.email) {
      throw new BadRequestException(
        'User email is required for QR code generation',
      );
    }

    // Generate new token if doesn't exist or regenerate
    let qrCodeToken = user.qrCodeToken;
    if (!qrCodeToken) {
      qrCodeToken = this.qrCodeService.generateQRToken();
    }

    // Generate encrypted QR data
    const encryptedData = await this.qrCodeService.generateQRCodeData(
      user.userId || user.id,
      merchantId,
      user.email,
      qrCodeToken,
    );

    // Generate QR code image
    const qrCodeImage =
      await this.qrCodeService.generateQRCodeImage(encryptedData);

    // Update user with new token
    await (this.prisma as any).merchantUser.update({
      where: { id: userId },
      data: {
        qrCodeToken,
        qrCodeGeneratedAt: new Date(),
      },
    });

    return {
      qrCodeImage, // Data URL of QR code image
      qrCodeData: encryptedData, // Encrypted data string (for direct scanning)
      email: user.email,
      generatedAt: new Date(),
    };
  }

  /**
   * Validate QR code and return login credentials
   * This endpoint validates the QR code and returns email + password for auto-fill
   */
  async validateQRCodeForLogin(qrData: string, requestOrigin: string) {
    try {
      // Decrypt and validate QR code data
      const decoded = this.qrCodeService.decryptQRCodeData(
        qrData,
        requestOrigin,
      );

      // Find user by token
      const user = await (this.prisma as any).merchantUser.findFirst({
        where: {
          qrCodeToken: decoded.token,
          userId: decoded.userId,
          merchantId: decoded.merchantId,
          status: 'ACTIVE',
        },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException(
          'Invalid QR code: user not found or inactive',
        );
      }

      // Check if merchant is active
      if (user.merchant.status !== 'ACTIVE') {
        throw new UnauthorizedException('Merchant account is not active');
      }

      // Decrypt password
      if (!user.encryptedPassword) {
        throw new BadRequestException(
          'Password not available. Please use regular login.',
        );
      }

      const decryptedPassword = CryptoJS.AES.decrypt(
        user.encryptedPassword,
        this.encryptionKey,
      ).toString(CryptoJS.enc.Utf8);

      if (!decryptedPassword) {
        throw new BadRequestException(
          'Failed to decrypt password. Please use regular login.',
        );
      }

      // Optional: Clear encrypted password after first use for security
      // Uncomment if you want one-time use QR codes
      // await (this.prisma as any).merchantUser.update({
      //   where: { id: user.id },
      //   data: { encryptedPassword: null },
      // });

      return {
        email: user.email,
        password: decryptedPassword,
        userId: user.userId,
        merchantId: user.merchantId,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired QR code');
    }
  }

  /**
   * Send ban notification email to merchant owner
   */
  async sendBanNotification(merchantId: string) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id: merchantId },
      include: {
        users: {
          where: { role: 'MERCHANT_OWNER' },
          select: { userId: true, email: true },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Send notification to merchant owner about ban
    try {
      const ownerUser = merchant.users.find((u) => u.userId);
      if (ownerUser?.userId) {
        await this.notificationService.notifyMerchantBan(
          merchant.id,
          merchant.name,
          ownerUser.userId,
          'Account suspended by administrator',
        );
      } else {
        // If no userId found, try to find by email and send notification
        const ownerWithEmail = merchant.users.find((u) => u.email);
        if (ownerWithEmail?.email) {
          console.log(
            `Owner userId not found for merchant ${merchant.id}, attempting to find by email: ${ownerWithEmail.email}`,
          );
          const authUser = await this.findAuthUserByEmail(ownerWithEmail.email);
          if (authUser?.id) {
            await this.notificationService.notifyMerchantBan(
              merchant.id,
              merchant.name,
              authUser.id,
              'Account suspended by administrator',
            );
          } else {
            console.log(
              `No Better Auth user found for email ${ownerWithEmail.email}, sending email directly`,
            );
            await this.notificationService.notifyMerchantBanByEmail(
              merchant.id,
              merchant.name,
              ownerWithEmail.email,
              'Account suspended by administrator',
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send merchant ban notification:', error);
      throw error; // Re-throw to let caller know notification failed
    }

    return { message: 'Ban notification sent successfully' };
  }

  /**
   * Send unban notification email to merchant owner
   */
  async sendUnbanNotification(merchantId: string) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id: merchantId },
      include: {
        users: {
          where: { role: 'MERCHANT_OWNER' },
          select: { userId: true, email: true },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Send notification to merchant owner about unban
    try {
      const ownerUser = merchant.users.find((u) => u.userId);
      if (ownerUser?.userId) {
        await this.notificationService.notifyMerchantUnban(
          merchant.id,
          merchant.name,
          ownerUser.userId,
        );
      } else {
        // If no userId found, try to find by email and send notification
        const ownerWithEmail = merchant.users.find((u) => u.email);
        if (ownerWithEmail?.email) {
          console.log(
            `Owner userId not found for merchant ${merchant.id}, attempting to find by email: ${ownerWithEmail.email}`,
          );
          const authUser = await this.findAuthUserByEmail(ownerWithEmail.email);
          if (authUser?.id) {
            await this.notificationService.notifyMerchantUnban(
              merchant.id,
              merchant.name,
              authUser.id,
            );
          } else {
            console.log(
              `No Better Auth user found for email ${ownerWithEmail.email}, sending email directly`,
            );
            await this.notificationService.notifyMerchantUnbanByEmail(
              merchant.id,
              merchant.name,
              ownerWithEmail.email,
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send merchant unban notification:', error);
      throw error; // Re-throw to let caller know notification failed
    }

    return { message: 'Unban notification sent successfully' };
  }
}
