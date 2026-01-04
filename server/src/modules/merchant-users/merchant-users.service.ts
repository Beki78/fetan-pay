import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class MerchantUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(req: Request) {
    const authUser = (req as any)?.user;
    const authUserId: string | undefined = authUser?.id;

    if (!authUserId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const membership = await (this.prisma as any).merchantUser.findFirst({
      where: { userId: authUserId },
      select: {
        id: true,
        role: true,
        status: true,
        name: true,
        email: true,
        phone: true,
        merchant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Not every auth user will have merchant membership.
    return { membership };
  }
}
