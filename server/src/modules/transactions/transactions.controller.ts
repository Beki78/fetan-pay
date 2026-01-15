import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
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
import type { Request } from 'express';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { ListVerifiedByUserQueryDto } from './dto/list-verified-by-user.dto';
import { VerifyFromQrDto } from './dto/verify-from-qr.dto';
import { PublicVerifyDto } from './dto/public-verify.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('verify-from-qr')
  @ApiOperation({
    summary: 'Verify a transaction by parsing its QR URL',
    description:
      'Verifies a transaction by parsing the QR code URL and extracting transaction details.',
  })
  @ApiBody({ type: VerifyFromQrDto })
  @ApiResponse({
    status: 200,
    description: 'Transaction verified successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid QR URL or parsing failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyFromQr(@Body() body: VerifyFromQrDto, @Req() req: Request) {
    return this.transactionsService.verifyFromQr(body, req);
  }

  @Get()
  @ApiOperation({
    summary: 'List stored transactions with optional filters',
    description:
      'Retrieves a paginated list of stored transactions with optional filtering by merchant, provider, status, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Query() query: ListTransactionsQueryDto, @Req() req: Request) {
    return this.transactionsService.listTransactions(query, req);
  }

  @Get('verified-by/:merchantUserId')
  @ApiOperation({
    summary: 'List transactions verified by a specific merchant user',
    description:
      'Returns transactions where verifiedById matches the given merchant user id. Optional merchantId query scopes results to a merchant.',
  })
  @ApiParam({
    name: 'merchantUserId',
    description: 'Merchant user ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant user not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listVerifiedByUser(
    @Param('merchantUserId') merchantUserId: string,
    @Query() query: ListVerifiedByUserQueryDto,
  ) {
    return this.transactionsService.listVerifiedByUser(merchantUserId, query);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public payment details for a transaction (no auth required)',
    description:
      'Retrieves limited payment details needed for the public payment page.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID or reference',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getPublicPaymentDetails(@Param('id') id: string) {
    return this.transactionsService.getPublicPaymentDetails(id);
  }

  @Post('public/verify')
  @ApiOperation({
    summary: 'Verify a payment publicly (no auth required)',
    description:
      'Verifies a payment using the bank transaction reference. Called from the public payment page.',
  })
  @ApiBody({ type: PublicVerifyDto })
  @ApiResponse({
    status: 200,
    description: 'Payment verification result',
  })
  @ApiResponse({ status: 400, description: 'Invalid reference or expired' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async publicVerify(@Body() body: PublicVerifyDto) {
    return this.transactionsService.publicVerify(body);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single transaction by ID or reference',
    description:
      'Retrieves detailed information about a specific transaction by its ID or reference.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID or reference',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOne(@Param('id') id: string, @Req() req: Request) {
    return this.transactionsService.getTransaction(id, req);
  }
}
