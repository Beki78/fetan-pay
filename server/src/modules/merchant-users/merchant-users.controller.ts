import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantUsersService } from './merchant-users.service';

@ApiTags('merchant-users')
@Controller('merchant-users')
export class MerchantUsersController {
  constructor(private readonly merchantUsersService: MerchantUsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current merchant user membership + merchant info',
    description:
      'Uses Better Auth session (req.user) to find MerchantUser by userId and returns membership + merchant (business) name.',
  })
  async me(@Req() req: Request) {
    return this.merchantUsersService.me(req);
  }
}
