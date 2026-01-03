import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { SelfRegisterMerchantDto } from './dto/self-register-merchant.dto';
import { AdminCreateMerchantDto } from './dto/admin-create-merchant.dto';
import { MerchantQueryDto } from './dto/merchant-query.dto';
import { ApproveMerchantDto } from './dto/approve-merchant.dto';
import { RejectMerchantDto } from './dto/reject-merchant.dto';

// This controller handles merchant onboarding and account provisioning. Authentication itself is handled
// by Better Auth (see auth.ts). Routes here stay focused on merchant + staff membership records and
// defer credential lifecycle to Better Auth.
@ApiTags('merchant-accounts')
@Controller('merchant-accounts')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('self-register')
  @AllowAnonymous() // Self-registration is public
  @ApiOperation({
    summary:
      'Merchant self-registration (creates pending merchant + owner membership)',
    description:
      'Creates merchant + owner membership; authentication/credentials are handled via Better Auth (user signs up separately).',
  })
  async selfRegister(@Body() body: SelfRegisterMerchantDto) {
    return this.merchantsService.selfRegister(body);
  }

  @Get()
  @ApiOperation({ summary: 'List merchants with users (paginated)' })
  async list(@Query() query: MerchantQueryDto) {
    return this.merchantsService.findAll(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Admin creates a merchant (active or pending) with owner invite',
    description:
      'Creates merchant + owner membership; Better Auth still owns credentials. Use email invite flow to let the owner sign in.',
  })
  async adminCreate(@Body() body: AdminCreateMerchantDto) {
    return this.merchantsService.adminCreate(body);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve merchant (set ACTIVE, stamp approvedAt/approvedBy)',
  })
  async approve(@Param('id') id: string, @Body() body: ApproveMerchantDto) {
    return this.merchantsService.approve(id, body);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject merchant (set SUSPENDED, stamp rejectedBy)' })
  async reject(@Param('id') id: string, @Body() body: RejectMerchantDto) {
    return this.merchantsService.reject(id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant with users' })
  async getOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }
}
