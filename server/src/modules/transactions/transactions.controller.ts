import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { ListVerifiedByUserQueryDto } from './dto/list-verified-by-user.dto';
import { VerifyFromQrDto } from './dto/verify-from-qr.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('verify-from-qr')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Verify a transaction by parsing its QR URL' })
  async verifyFromQr(@Body() body: VerifyFromQrDto) {
    return this.transactionsService.verifyFromQr(body);
  }

  @Get()
  @ApiOperation({ summary: 'List stored transactions with optional filters' })
  async list(@Query() query: ListTransactionsQueryDto) {
    return this.transactionsService.listTransactions(query);
  }

  @Get('verified-by/:merchantUserId')
  @ApiOperation({
    summary: 'List transactions verified by a specific merchant user',
    description:
      'Returns transactions where verifiedById matches the given merchant user id. Optional merchantId query scopes results to a merchant.',
  })
  async listVerifiedByUser(
    @Param('merchantUserId') merchantUserId: string,
    @Query() query: ListVerifiedByUserQueryDto,
  ) {
    return this.transactionsService.listVerifiedByUser(merchantUserId, query);
  }
}
