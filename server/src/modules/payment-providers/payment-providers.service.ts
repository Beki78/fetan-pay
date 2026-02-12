import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { Request } from 'express';
import { UpsertPaymentProviderDto } from './dto/upsert-payment-provider.dto';

@Injectable()
export class PaymentProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin-only: create or update a provider.
   * AuthZ is enforced by checking Better Auth admin role on the current user.
   */
  async upsert(dto: UpsertPaymentProviderDto, req: Request) {
    this.requireAdmin(req);

    const provider = await (this.prisma as any).paymentProvider.upsert({
      where: { code: dto.code },
      update: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        status: dto.status ?? 'COMING_SOON',
      },
      create: {
        code: dto.code,
        name: dto.name,
        logoUrl: dto.logoUrl,
        status: dto.status ?? 'COMING_SOON',
      },
    });

    return { provider };
  }

  /** Admin-only: remove a provider from the catalog entirely */
  async remove(code: string, req: Request) {
    this.requireAdmin(req);
    await (this.prisma as any).paymentProvider.delete({ where: { code } });
    return { ok: true };
  }

  /** Public/merchant: list providers for UI (filtering optional) */
  async list(status: string | undefined) {
    const where = status ? { status } : {};
    const providers = await (this.prisma as any).paymentProvider.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return { providers };
  }

  private requireAdmin(req: Request) {
    const user = (req as any).user as any;
    const role = user?.role as string | undefined;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
  }
}
