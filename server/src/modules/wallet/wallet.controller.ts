import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WalletService } from './wallet.service';
import { VerifyWalletDepositDto } from './dto/verify-wallet-deposit.dto';
import { SetDepositReceiverDto } from './dto/set-deposit-receiver.dto';
import { ManualDepositDto } from './dto/manual-deposit.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { WalletTransactionHistoryDto } from './dto/wallet-transaction-history.dto';
import { UpdateMerchantWalletConfigDto } from './dto/update-merchant-wallet-config.dto';
import { CreateWalletDepositDto } from './dto/create-wallet-deposit.dto';
import type { Request } from 'express';

@ApiTags('wallet')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('config')
  @ApiOperation({
    summary: 'Get merchant wallet configuration',
    description: 'Returns the wallet configuration (charge type, charge value, etc.) for the authenticated merchant',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        walletEnabled: { type: 'boolean' },
        walletChargeType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'], nullable: true },
        walletChargeValue: { type: 'number', nullable: true },
        walletMinBalance: { type: 'number', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWalletConfig(@Req() req: Request) {
    // Access private method via type assertion
    const membership = await (this.walletService as any).requireMembership(req);
    return this.walletService.getMerchantWalletConfig(membership.merchantId);
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Get current wallet balance',
    description: 'Returns the current wallet balance for the authenticated merchant',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        balance: { type: 'number', example: 5000.0 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBalance(@Req() req: Request) {
    // Access private method via type assertion
    const membership = await (this.walletService as any).requireMembership(req);
    const balance = await this.walletService.getBalance(membership.merchantId);
    return { balance: balance.toNumber() };
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Get wallet transaction history',
    description: 'Returns paginated wallet transaction history for the authenticated merchant',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
  })
  async getTransactionHistory(
    @Req() req: Request,
    @Query() query: WalletTransactionHistoryDto,
  ) {
    // Access private method via type assertion
    const membership = await (this.walletService as any).requireMembership(req);
    return this.walletService.getTransactionHistory(
      membership.merchantId,
      query,
    );
  }

  @Get('deposit-receivers')
  @ApiOperation({
    summary: 'Get wallet deposit receiver accounts',
    description: 'Returns all active wallet deposit receiver accounts where merchants can send money',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit receiver accounts retrieved successfully',
  })
  async getDepositReceiverAccounts() {
    return this.walletService.getDepositReceiverAccounts();
  }

  @Get('pending-deposits')
  @ApiOperation({
    summary: 'Get pending wallet deposits',
    description: 'Returns all pending wallet deposits for the authenticated merchant',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending deposits retrieved successfully',
  })
  async getPendingDeposits(@Req() req: Request) {
    const membership = await (this.walletService as any).requireMembership(req);
    return this.walletService.getPendingDeposits(membership.merchantId);
  }

  @Post('create-deposit')
  @ApiOperation({
    summary: 'Create a pending wallet deposit',
    description: 'Creates a pending deposit request that expires after 30 minutes',
  })
  @ApiResponse({
    status: 201,
    description: 'Pending deposit created successfully',
  })
  async createPendingDeposit(
    @Body() body: CreateWalletDepositDto,
    @Req() req: Request,
  ) {
    return this.walletService.createPendingDeposit(body, req);
  }

  @Post('verify-deposit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Verify wallet deposit',
    description:
      'Verify a wallet deposit by scanning QR code or entering transaction reference. If verified, amount is added to wallet balance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit verification result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        status: {
          type: 'string',
          enum: ['VERIFIED', 'UNVERIFIED', 'PENDING'],
        },
        amount: { type: 'number', nullable: true },
        walletDeposit: { type: 'object' },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Deposit already verified' })
  @ApiResponse({ status: 429, description: 'Too many requests (rate limited)' })
  async verifyWalletDeposit(
    @Body() body: VerifyWalletDepositDto,
    @Req() req: Request,
  ) {
    return this.walletService.verifyWalletDeposit(body, req);
  }

  // Admin endpoints

  @Post('deposit-receivers')
  @ApiOperation({
    summary: 'Configure wallet deposit receiver account (Admin only)',
    description: 'Create or update a wallet deposit receiver account for a specific provider',
  })
  @ApiResponse({
    status: 201,
    description: 'Deposit receiver account configured successfully',
  })
  async setDepositReceiverAccount(@Body() body: SetDepositReceiverDto) {
    return this.walletService.setDepositReceiverAccount(body);
  }

  @Post('deposit')
  @ApiOperation({
    summary: 'Manual wallet deposit (Admin only)',
    description: 'Manually deposit funds to a merchant wallet',
  })
  @ApiResponse({
    status: 201,
    description: 'Deposit successful',
  })
  async manualDeposit(@Body() body: ManualDepositDto) {
    return this.walletService.manualDeposit(body);
  }

  @Post('adjust')
  @ApiOperation({
    summary: 'Adjust wallet balance (Admin only)',
    description: 'Manually adjust a merchant wallet balance (positive to add, negative to subtract)',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance adjusted successfully',
  })
  async adjustBalance(@Body() body: AdjustBalanceDto) {
    return this.walletService.adjustBalance(body);
  }

  @Put('merchant/:merchantId/config')
  @ApiOperation({
    summary: 'Update merchant wallet configuration (Admin only)',
    description: 'Update wallet settings for a specific merchant (charge type, rate, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet configuration updated successfully',
  })
  async updateMerchantWalletConfig(
    @Body() body: UpdateMerchantWalletConfigDto,
    @Param('merchantId') merchantId: string,
  ) {
    return this.walletService.updateMerchantWalletConfig(merchantId, body);
  }
}

