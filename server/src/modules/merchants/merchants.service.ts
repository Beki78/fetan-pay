import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SelfRegisterMerchantDto } from './dto/self-register-merchant.dto';
import { AdminCreateMerchantDto, MerchantStatusDto } from './dto/admin-create-merchant.dto';

type MerchantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
type MerchantUserRole = 'MERCHANT_OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'SALES' | 'WAITER';
type MerchantUserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async selfRegister(dto: SelfRegisterMerchantDto) {
  const merchant = await (this.prisma as any).merchant.create({
      data: {
        name: dto.name,
        tin: dto.tin,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        status: 'PENDING',
        source: 'self_registered',
        users: {
          create: {
            role: 'MERCHANT_OWNER',
            status: 'ACTIVE',
            email: dto.ownerEmail,
            phone: dto.ownerPhone,
            name: dto.ownerName,
          },
        },
      },
      include: { users: true },
    });

    return merchant;
  }

  async adminCreate(dto: AdminCreateMerchantDto) {
    const targetStatus = dto.status ?? MerchantStatusDto.ACTIVE;

  const merchant = await (this.prisma as any).merchant.create({
      data: {
        name: dto.name,
        tin: dto.tin,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        status: targetStatus as unknown as MerchantStatus,
        source: 'admin_created',
        approvedAt: targetStatus === MerchantStatusDto.ACTIVE ? new Date() : undefined,
        users: {
          create: {
            role: 'MERCHANT_OWNER',
            status: 'INVITED',
            email: dto.ownerEmail,
            phone: dto.ownerPhone,
            name: dto.ownerName,
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
}
