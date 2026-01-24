import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { MerchantUsersService, MerchantMembershipResponse } from './merchant-users.service';

@ApiTags('merchant-users')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('merchant-users')
export class MerchantUsersController {
  constructor(private readonly merchantUsersService: MerchantUsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current merchant user membership + merchant info',
    description:
      'Uses Better Auth session (req.user) to find MerchantUser by userId and returns membership + merchant (business) name.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        membership: { type: 'object' },
        merchant: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async me(@Req() req: Request): Promise<MerchantMembershipResponse> {
    return this.merchantUsersService.me(req);
  }
}
