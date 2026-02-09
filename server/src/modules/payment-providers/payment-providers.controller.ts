import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { UpsertPaymentProviderDto } from './dto/upsert-payment-provider.dto';
import { PaymentProvidersService } from './payment-providers.service';
import { ApiKeyOrSessionGuard } from '../api-keys/guards/api-key-or-session.guard';

@ApiTags('payment-providers')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('payment-providers')
@UseGuards(ApiKeyOrSessionGuard)
export class PaymentProvidersController {
  constructor(private readonly providersService: PaymentProvidersService) {}

  @Get()
  @ApiOperation({
    summary: 'List payment providers (for merchant UI)',
    description:
      'Retrieves a list of available payment providers. Can be filtered by status.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by provider status',
    enum: ['ACTIVE', 'INACTIVE'],
  })
  @ApiResponse({
    status: 200,
    description: 'Payment providers retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Query('status') status?: string) {
    return this.providersService.list(status);
  }

  @Post()
  @ApiOperation({
    summary: 'Admin: create/update a payment provider',
    description:
      'Creates or updates a payment provider configuration. Requires admin authentication.',
  })
  @ApiBody({ type: UpsertPaymentProviderDto })
  @ApiResponse({
    status: 200,
    description: 'Payment provider created/updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async upsert(@Body() body: UpsertPaymentProviderDto, @Req() req: Request) {
    return this.providersService.upsert(body, req);
  }

  @Delete(':code')
  @ApiOperation({
    summary: 'Admin: delete a payment provider',
    description:
      'Deletes a payment provider configuration. Requires admin authentication.',
  })
  @ApiParam({
    name: 'code',
    description: 'Payment provider code',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment provider deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment provider not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async remove(@Param('code') code: string, @Req() req: Request) {
    return this.providersService.remove(code, req);
  }
}
