import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
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
import { auth } from '../../../auth';

type MerchantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
type MerchantUserRole =
  | 'MERCHANT_OWNER'
  | 'ADMIN'
  | 'ACCOUNTANT'
  | 'SALES'
  | 'WAITER';
type MerchantUserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

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
    await this.getUser(merchantId, merchantUserId);
    return (this.prisma as any).merchantUser.update({
      where: { id: merchantUserId },
      data: { status: 'SUSPENDED' as MerchantUserStatus },
    });
  }

  async activateUser(
    merchantId: string,
    merchantUserId: string,
    _dto: SetMerchantUserStatusDto,
  ) {
    await this.getUser(merchantId, merchantUserId);
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

    return merchant;
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
      include: { users: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    return merchant;
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

    const [data, total] = await this.prisma.$transaction([
      (this.prisma as any).merchant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { users: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (this.prisma as any).merchant.count({ where }),
    ]);

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

    // Activate any invited users for this merchant
    await (this.prisma as any).merchantUser.updateMany({
      where: { merchantId: id, status: 'INVITED' },
      data: { status: 'ACTIVE' as MerchantUserStatus },
    });

    return updated;
  }

  async reject(id: string, dto: RejectMerchantDto) {
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const updated = await (this.prisma as any).merchant.update({
      where: { id },
      data: {
        status: 'SUSPENDED' as MerchantStatus,
        approvedAt: null,
        approvedBy: null,
        source: merchant.source,
      },
    });

    // Suspend any invited users as well
    await (this.prisma as any).merchantUser.updateMany({
      where: { merchantId: id },
      data: { status: 'SUSPENDED' as MerchantUserStatus },
    });

    return updated;
  }

  async createEmployee(
    merchantId: string,
    dto: CreateMerchantUserDto,
    requestHeaders?: Record<string, any>,
  ) {
    const merchant = await (this.prisma as any).merchant.findUnique({ where: { id: merchantId } });
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

    const membership = await (this.prisma as any).merchantUser.create({
      data: {
        merchantId,
        userId: authUserId,
        role: (dto.role as MerchantUserRole) || 'EMPLOYEE',
        status: 'ACTIVE' as MerchantUserStatus,
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
      },
    });

    return membership;
  }

  async listUsers(merchantId: string) {
    const merchant = await (this.prisma as any).merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const users = await (this.prisma as any).merchantUser.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }
}
