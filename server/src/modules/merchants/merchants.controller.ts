import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { SelfRegisterMerchantDto } from './dto/self-register-merchant.dto';
import { AdminCreateMerchantDto } from './dto/admin-create-merchant.dto';
import { MerchantQueryDto } from './dto/merchant-query.dto';
import { ApproveMerchantDto } from './dto/approve-merchant.dto';
import { RejectMerchantDto } from './dto/reject-merchant.dto';
import { CreateMerchantUserDto } from './dto/create-merchant-user.dto';
import { UpdateMerchantUserDto } from './dto/update-merchant-user.dto';
import { SetMerchantUserStatusDto } from './dto/set-merchant-user-status.dto';

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

  @Get(':id/users')
  @ApiOperation({ summary: 'List users for a merchant account' })
  async listUsers(@Param('id') id: string) {
    return this.merchantsService.listUsers(id);
  }

  @Post(':id/users')
  @ApiOperation({ summary: 'Create a merchant employee with auth account' })
  async createUser(
    @Param('id') id: string,
    @Body() body: CreateMerchantUserDto,
    @Req() req: Request,
  ) {
    return this.merchantsService.createEmployee(id, body, req.headers);
  }

  @Get(':merchantId/users/:userId')
  @ApiOperation({ summary: 'Get a merchant employee by id' })
  async getUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
  ) {
    return this.merchantsService.getUser(merchantId, userId);
  }

  @Patch(':merchantId/users/:userId')
  @ApiOperation({ summary: 'Update a merchant employee (profile/role)' })
  async updateUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateMerchantUserDto,
  ) {
    return this.merchantsService.updateUser(merchantId, userId, body);
  }

  @Patch(':merchantId/users/:userId/deactivate')
  @ApiOperation({ summary: 'Deactivate/suspend a merchant employee' })
  async deactivateUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
    @Body() body: SetMerchantUserStatusDto,
  ) {
    return this.merchantsService.deactivateUser(merchantId, userId, body);
  }

  @Patch(':merchantId/users/:userId/activate')
  @ApiOperation({ summary: 'Activate a merchant employee' })
  async activateUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
    @Body() body: SetMerchantUserStatusDto,
  ) {
    return this.merchantsService.activateUser(merchantId, userId, body);
  }
}
