import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UpsertPaymentProviderDto } from './dto/upsert-payment-provider.dto';
import { PaymentProvidersService } from './payment-providers.service';

@ApiTags('payment-providers')
@Controller('payment-providers')
export class PaymentProvidersController {
  constructor(private readonly providersService: PaymentProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'List payment providers (for merchant UI)' })
  async list(@Query('status') status?: string) {
    return this.providersService.list(status);
  }

  @Post()
  @ApiOperation({ summary: 'Admin: create/update a payment provider' })
  async upsert(@Body() body: UpsertPaymentProviderDto, @Req() req: Request) {
    return this.providersService.upsert(body, req);
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Admin: delete a payment provider' })
  async remove(@Param('code') code: string, @Req() req: Request) {
    return this.providersService.remove(code, req);
  }
}
