import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';
import { SetActiveReceiverDto } from './dto/set-active-receiver.dto';
import { SubmitPaymentClaimDto } from './dto/submit-payment-claim.dto';
import { DisableReceiverDto } from './dto/disable-receiver.dto';
import { ListVerificationHistoryDto } from './dto/list-verification-history.dto';
import { VerifyMerchantPaymentDto } from './dto/verify-merchant-payment.dto';
import { LogTransactionDto } from './dto/log-transaction.dto';
import { ListTipsDto } from './dto/list-tips.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('receiver-accounts/active')
  @ApiOperation({
    summary: 'Set the merchant active receiver account for a provider',
    description:
      'Sets or updates the active receiver account for a specific payment provider. This account will be used for payment verification.',
  })
  @ApiBody({ type: SetActiveReceiverDto })
  @ApiResponse({
    status: 200,
    description: 'Receiver account set successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setActiveReceiver(@Body() body: SetActiveReceiverDto, @Req() req: Request) {
    return this.paymentsService.setActiveReceiverAccount(body, req);
  }

  @Get('receiver-accounts/active')
  @ApiOperation({
    summary: 'Get the merchant active receiver account for a provider (or all providers)',
    description:
      'Retrieves the active receiver account(s) for the authenticated merchant. If provider is specified, returns only that provider. Otherwise, returns all active receiver accounts.',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    description: 'Payment provider code (CBE, TELEBIRR, AWASH, BOA, DASHEN)',
    enum: ['CBE', 'TELEBIRR', 'AWASH', 'BOA', 'DASHEN'],
  })
  @ApiResponse({
    status: 200,
    description: 'Active receiver account(s) retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActiveReceiver(
    @Query('provider') provider: string | undefined,
    @Req() req: Request,
  ) {
    return this.paymentsService.getActiveReceiverAccount(provider, req);
  }

  @Post('receiver-accounts/disable')
  @ApiOperation({
    summary: 'Disable the active receiver account for a provider',
    description: 'Disables the currently active receiver account for a payment provider.',
  })
  @ApiBody({ type: DisableReceiverDto })
  @ApiResponse({
    status: 200,
    description: 'Receiver account disabled successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async disableActiveReceiver(@Body() body: DisableReceiverDto, @Req() req: Request) {
    return this.paymentsService.disableActiveReceiverAccount(body, req);
  }

  @Post('receiver-accounts/enable')
  @ApiOperation({
    summary: 'Enable the most recently configured receiver account for a provider',
    description:
      'Enables the most recently configured (but currently disabled) receiver account for a payment provider.',
  })
  @ApiBody({ type: DisableReceiverDto })
  @ApiResponse({
    status: 200,
    description: 'Receiver account enabled successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enableReceiver(@Body() body: DisableReceiverDto, @Req() req: Request) {
    return this.paymentsService.enableLastReceiverAccount(body, req);
  }

  @Post('orders')
  @ApiOperation({
    summary: 'Create an order with expected amount (simple mock)',
    description: 'Creates a new order with an expected payment amount. Used for waiter payment claim verification.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order and transaction created successfully',
    schema: {
      type: 'object',
      properties: {
        order: { type: 'object' },
        transaction: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrder(@Body() body: CreateOrderDto, @Req() req: Request) {
    return this.paymentsService.createOrder(body, req);
  }

  @Post('log-transaction')
  @ApiOperation({
    summary: 'Log a transaction (cash or bank payment)',
    description:
      'Creates an order and payment record for manually logged transactions. Supports both cash and bank payments with optional tips and notes. For bank transactions, a receipt image can be uploaded.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['paymentMethod', 'amount'],
      properties: {
        paymentMethod: { type: 'string', enum: ['cash', 'bank'] },
        amount: { type: 'number' },
        tipAmount: { type: 'number' },
        note: { type: 'string' },
        provider: { type: 'string', enum: ['CBE', 'TELEBIRR', 'AWASH', 'BOA', 'DASHEN'] },
        otherBankName: { type: 'string' },
        receipt: {
          type: 'string',
          format: 'binary',
          description: 'Receipt image file (optional, for bank transactions)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction logged successfully',
    schema: {
      type: 'object',
      properties: {
        payment: { type: 'object' },
        order: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('receipt'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async logTransaction(
    @Body() body: LogTransactionDto,
    @UploadedFile() receiptFile: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    return this.paymentsService.logTransaction(body, req, receiptFile);
  }

  @Post('claims')
  @ApiOperation({
    summary: 'Submit a waiter payment claim and verify against order amount + active receiver',
    description:
      'Submits a payment claim from a waiter and verifies it against the order amount and active receiver account. Only VERIFIED transactions are saved.',
  })
  @ApiBody({ type: SubmitPaymentClaimDto })
  @ApiResponse({
    status: 200,
    description: 'Payment claim submitted and verified',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or verification failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitClaim(@Body() body: SubmitPaymentClaimDto, @Req() req: Request) {
    return this.paymentsService.submitAndVerifyClaim(body, req);
  }

  @Post('verify')
  @ApiOperation({
    summary:
      'Verify a payment by provider+reference+amount against the merchant configured receiver account',
    description:
      'Verifies a payment transaction by checking the provider, reference, and amount against the merchant\'s configured receiver account. Rate-limited to prevent abuse. Only VERIFIED transactions are saved to the database.',
  })
  @ApiBody({ type: VerifyMerchantPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment verification result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        status: { type: 'string', enum: ['VERIFIED', 'UNVERIFIED', 'PENDING'] },
        transaction: { type: 'object' },
        checks: { type: 'object' },
        mismatchReason: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests (rate limited)' })
  @UseGuards(ThrottlerGuard)
  async verifyMerchantPayment(
    @Body() body: VerifyMerchantPaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.verifyMerchantPayment(body, req);
  }

  @Get('verification-history')
  @ApiOperation({
    summary: 'List merchant payment verification history',
    description: 'Retrieves paginated list of payment verification history for the authenticated merchant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification history retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listVerificationHistory(
    @Query() query: ListVerificationHistoryDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.listVerificationHistory(query, req);
  }

  @Get('claims/:paymentId')
  @ApiOperation({
    summary: 'Get a payment claim',
    description: 'Retrieves details of a specific payment claim by ID.',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment claim ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment claim retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment claim not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClaim(@Param('paymentId') paymentId: string, @Req() req: Request) {
    return this.paymentsService.getPayment(paymentId, req);
  }

  @Get('tips/summary')
  @ApiOperation({
    summary: 'Get tips summary for current merchant user',
    description:
      'Retrieves tip summary statistics for the authenticated merchant user. Can be filtered by date range. Only shows tips verified by the current user.',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601 format)',
    type: String,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601 format)',
    type: String,
    example: '2024-01-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Tips summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTipAmount: { type: 'number' },
        tipCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async tipsSummary(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: Request,
  ) {
    return this.paymentsService.getTipsSummary({ from, to }, req);
  }

  @Get('tips')
  @ApiOperation({
    summary: 'List tip transactions for current merchant user',
    description:
      'Retrieves paginated list of tip transactions for the authenticated merchant user. Only shows tips verified by the current user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tip transactions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listTips(
    @Query() query: ListTipsDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.listTips(query, req);
  }
}
