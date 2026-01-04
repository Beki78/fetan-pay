import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';
import { SetActiveReceiverDto } from './dto/set-active-receiver.dto';
import { SubmitPaymentClaimDto } from './dto/submit-payment-claim.dto';
import { DisableReceiverDto } from './dto/disable-receiver.dto';
import { ListVerificationHistoryDto } from './dto/list-verification-history.dto';
import { VerifyMerchantPaymentDto } from './dto/verify-merchant-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('receiver-accounts/active')
  @ApiOperation({ summary: 'Set the merchant active receiver account for a provider' })
  async setActiveReceiver(@Body() body: SetActiveReceiverDto, @Req() req: Request) {
    return this.paymentsService.setActiveReceiverAccount(body, req);
  }

  @Get('receiver-accounts/active')
  @ApiOperation({ summary: 'Get the merchant active receiver account for a provider (or all providers)' })
  async getActiveReceiver(
    @Query('provider') provider: string | undefined,
    @Req() req: Request,
  ) {
    return this.paymentsService.getActiveReceiverAccount(provider, req);
  }

  @Post('receiver-accounts/disable')
  @ApiOperation({ summary: 'Disable the active receiver account for a provider' })
  async disableActiveReceiver(@Body() body: DisableReceiverDto, @Req() req: Request) {
    return this.paymentsService.disableActiveReceiverAccount(body, req);
  }

  @Post('receiver-accounts/enable')
  @ApiOperation({ summary: 'Enable the most recently configured receiver account for a provider' })
  async enableReceiver(@Body() body: DisableReceiverDto, @Req() req: Request) {
    return this.paymentsService.enableLastReceiverAccount(body, req);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create an order with expected amount (simple mock)' })
  async createOrder(@Body() body: CreateOrderDto, @Req() req: Request) {
    return this.paymentsService.createOrder(body, req);
  }

  @Post('claims')
  @ApiOperation({
    summary: 'Submit a waiter payment claim and verify against order amount + active receiver',
  })
  async submitClaim(@Body() body: SubmitPaymentClaimDto, @Req() req: Request) {
    return this.paymentsService.submitAndVerifyClaim(body, req);
  }

  @Post('verify')
  @ApiOperation({
    summary:
      'Verify a payment by provider+reference+amount against the merchant configured receiver account',
  })
  async verifyMerchantPayment(
    @Body() body: VerifyMerchantPaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.verifyMerchantPayment(body, req);
  }

  @Get('verification-history')
  @ApiOperation({ summary: 'List merchant payment verification history' })
  async listVerificationHistory(
    @Query() query: ListVerificationHistoryDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.listVerificationHistory(query, req);
  }

  @Get('claims/:paymentId')
  @ApiOperation({ summary: 'Get a payment claim' })
  async getClaim(@Param('paymentId') paymentId: string, @Req() req: Request) {
    return this.paymentsService.getPayment(paymentId, req);
  }

  @Get('tips/summary')
  @ApiOperation({ summary: 'Simple tips summary for current merchant' })
  async tipsSummary(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: Request,
  ) {
    return this.paymentsService.getTipsSummary({ from, to }, req);
  }
}
