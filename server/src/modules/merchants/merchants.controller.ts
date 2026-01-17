import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { SelfRegisterMerchantDto } from './dto/self-register-merchant.dto';
import { AdminCreateMerchantDto } from './dto/admin-create-merchant.dto';
import { MerchantQueryDto } from './dto/merchant-query.dto';
import { ApproveMerchantDto } from './dto/approve-merchant.dto';
import { RejectMerchantDto } from './dto/reject-merchant.dto';
import { CreateMerchantUserDto } from './dto/create-merchant-user.dto';
import { UpdateMerchantUserDto } from './dto/update-merchant-user.dto';
import { SetMerchantUserStatusDto } from './dto/set-merchant-user-status.dto';
import { QrLoginDto } from './dto/qr-login.dto';
import { WalletService } from '../wallet/wallet.service';
import { UpdateMerchantWalletConfigDto } from '../wallet/dto/update-merchant-wallet-config.dto';

// This controller handles merchant onboarding and account provisioning. Authentication itself is handled
// by Better Auth (see auth.ts). Routes here stay focused on merchant + staff membership records and
// defer credential lifecycle to Better Auth.
@ApiTags('merchant-accounts')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('merchant-accounts')
export class MerchantsController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly walletService: WalletService,
  ) {}

  @Post('self-register')
  @AllowAnonymous() // Self-registration is public
  @ApiOperation({
    summary:
      'Merchant self-registration (creates pending merchant + owner membership)',
    description:
      'Creates merchant + owner membership; authentication/credentials are handled via Better Auth (user signs up separately). This endpoint is public and does not require authentication.',
  })
  @ApiBody({ type: SelfRegisterMerchantDto })
  @ApiResponse({
    status: 201,
    description: 'Merchant registered successfully (pending approval)',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Merchant with this email already exists' })
  async selfRegister(@Body() body: SelfRegisterMerchantDto) {
    return this.merchantsService.selfRegister(body);
  }

  @Get()
  @ApiOperation({
    summary: 'List merchants with users (paginated)',
    description: 'Retrieves a paginated list of merchants with their associated users. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Merchants retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async list(@Query() query: MerchantQueryDto) {
    return this.merchantsService.findAll(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Admin creates a merchant (active or pending) with owner invite',
    description:
      'Creates merchant + owner membership; Better Auth still owns credentials. Use email invite flow to let the owner sign in. Requires admin authentication.',
  })
  @ApiBody({ type: AdminCreateMerchantDto })
  @ApiResponse({
    status: 201,
    description: 'Merchant created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async adminCreate(@Body() body: AdminCreateMerchantDto) {
    return this.merchantsService.adminCreate(body);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve merchant (set ACTIVE, stamp approvedAt/approvedBy)',
    description: 'Approves a pending merchant account, setting status to ACTIVE. Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    type: String,
  })
  @ApiBody({ type: ApproveMerchantDto })
  @ApiResponse({
    status: 200,
    description: 'Merchant approved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async approve(@Param('id') id: string, @Body() body: ApproveMerchantDto) {
    return this.merchantsService.approve(id, body);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject merchant (set SUSPENDED, stamp rejectedBy)',
    description: 'Rejects a pending merchant account, setting status to SUSPENDED. Requires admin authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    type: String,
  })
  @ApiBody({ type: RejectMerchantDto })
  @ApiResponse({
    status: 200,
    description: 'Merchant rejected successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async reject(@Param('id') id: string, @Body() body: RejectMerchantDto) {
    return this.merchantsService.reject(id, body);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get merchant with users',
    description: 'Retrieves detailed information about a specific merchant including associated users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Merchant retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  @Get(':id/users')
  @ApiOperation({
    summary: 'List users for a merchant account',
    description: 'Retrieves all users (employees) associated with a merchant account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listUsers(@Param('id') id: string) {
    return this.merchantsService.listUsers(id);
  }

  @Post(':id/users')
  @ApiOperation({
    summary: 'Create a merchant employee with auth account',
    description: 'Creates a new employee user for a merchant account. Also creates the corresponding Better Auth user account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    type: String,
  })
  @ApiBody({ type: CreateMerchantUserDto })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createUser(
    @Param('id') id: string,
    @Body() body: CreateMerchantUserDto,
    @Req() req: Request,
  ) {
    return this.merchantsService.createEmployee(id, body, req.headers);
  }

  @Get(':merchantId/users/:userId')
  @ApiOperation({
    summary: 'Get a merchant employee by id',
    description: 'Retrieves detailed information about a specific merchant employee.',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User or merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
  ) {
    return this.merchantsService.getUser(merchantId, userId);
  }

  @Patch(':merchantId/users/:userId')
  @ApiOperation({
    summary: 'Update a merchant employee (profile/role)',
    description: 'Updates profile information and/or role for a merchant employee.',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiBody({ type: UpdateMerchantUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User or merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateMerchantUserDto,
  ) {
    return this.merchantsService.updateUser(merchantId, userId, body);
  }

  @Patch(':merchantId/users/:userId/deactivate')
  @ApiOperation({
    summary: 'Deactivate/suspend a merchant employee',
    description: 'Deactivates or suspends a merchant employee account.',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiBody({ type: SetMerchantUserStatusDto })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'User or merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
    @Body() body: SetMerchantUserStatusDto,
  ) {
    return this.merchantsService.deactivateUser(merchantId, userId, body);
  }

  @Patch(':merchantId/users/:userId/activate')
  @ApiOperation({
    summary: 'Activate a merchant employee',
    description: 'Activates a previously deactivated merchant employee account.',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiBody({ type: SetMerchantUserStatusDto })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
  })
  @ApiResponse({ status: 404, description: 'User or merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activateUser(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
    @Body() body: SetMerchantUserStatusDto,
  ) {
    return this.merchantsService.activateUser(merchantId, userId, body);
  }

  @Get(':merchantId/users/:userId/qr-code')
  @ApiOperation({
    summary: 'Get QR code for merchant user login',
    description: 'Generates or retrieves QR code for a merchant user. QR code can be scanned to auto-fill login credentials.',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'Merchant User ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'QR code generated successfully',
  })
  @ApiResponse({ status: 404, description: 'User or merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQRCode(
    @Param('merchantId') merchantId: string,
    @Param('userId') userId: string,
  ) {
    return this.merchantsService.generateQRCode(merchantId, userId);
  }

  @Post('qr-login')
  @AllowAnonymous() // Public endpoint for QR login
  @ApiOperation({
    summary: 'Validate QR code and get login credentials',
    description: 'Validates scanned QR code and returns email + password for auto-fill. Only works from authorized merchant app domain.',
  })
  @ApiBody({ type: QrLoginDto })
  @ApiResponse({
    status: 200,
    description: 'QR code validated, credentials returned',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired QR code' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async qrLogin(@Body() body: QrLoginDto, @Req() req: Request) {
    // Get origin from request if not provided
    const origin = body.origin || req.headers.origin || req.headers.referer || '';
    return this.merchantsService.validateQRCodeForLogin(body.qrData, origin);
  }

  @Get(':id/wallet-config')
  @ApiOperation({
    summary: 'Get merchant wallet configuration (Admin only)',
    description: 'Retrieves wallet configuration (charge type, charge value, etc.) for a specific merchant',
  })
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet configuration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getMerchantWalletConfig(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    this.requireAdmin(req);
    const config = await this.walletService.getMerchantWalletConfig(id);
    // Also include wallet balance
    const balance = await this.walletService.getBalance(id);
    return {
      ...config,
      walletBalance: typeof balance === 'object' && 'toNumber' in balance 
        ? balance.toNumber() 
        : Number(balance),
    };
  }

  @Put(':id/wallet-config')
  @ApiOperation({
    summary: 'Update merchant wallet configuration (Admin only)',
    description: 'Update wallet settings for a specific merchant (charge type, rate, etc.)',
  })
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    type: String,
  })
  @ApiBody({ type: UpdateMerchantWalletConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Wallet configuration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async updateMerchantWalletConfig(
    @Param('id') id: string,
    @Body() body: UpdateMerchantWalletConfigDto,
    @Req() req: Request,
  ) {
    this.requireAdmin(req);
    return this.walletService.updateMerchantWalletConfig(id, body);
  }

  private requireAdmin(req: Request) {
    const user = (req as any).user as any;
    const role = user?.role as string | undefined;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
  }
}
