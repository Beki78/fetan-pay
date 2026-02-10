import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';

interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
}

export interface MerchantMembership {
  id: string;
  role: string;
  status: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  merchant: {
    id: string;
    name: string;
    status: string;
    branding?: {
      logoUrl: string | null;
      primaryColor: string;
      secondaryColor: string;
      displayName: string | null;
      tagline: string | null;
      showPoweredBy: boolean;
    } | null;
  } | null;
}

export interface MerchantMembershipResponse {
  membership: MerchantMembership | null;
}

@Injectable()
export class MerchantUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(req: Request): Promise<MerchantMembershipResponse> {
    const reqWithUser = req as RequestWithUser;
    const authUser = reqWithUser?.user;
    const authUserId: string | undefined = authUser?.id;

    if (!authUserId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Check Better Auth user's banned status
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const authUserRecord = await (this.prisma as any).user.findUnique({
      where: { id: authUserId },
      select: {
        id: true,
        banned: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (authUserRecord?.banned) {
      throw new UnauthorizedException(
        'Your account has been banned. Please contact support.',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const membership = (await (this.prisma as any).merchantUser.findFirst({
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
            status: true,
          },
        },
      },
    })) as MerchantMembership | null;

    // Not every auth user will have merchant membership.
    if (!membership) {
      return { membership: null };
    }

    // Check if merchant user is active (status should be ACTIVE, not INVITED)
    if (membership.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `Your account is ${membership.status}. Please contact support.`,
      );
    }

    // Check if merchant is active (not PENDING)
    if (membership.merchant && membership.merchant.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `Merchant account is ${membership.merchant.status}. Please contact support.`,
      );
    }

    return { membership };
  }
}
