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
}
