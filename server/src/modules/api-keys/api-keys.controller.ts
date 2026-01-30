import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ProtectApiKeys } from '../../common/decorators/subscription-protection.decorator';

@ApiTags('api-keys')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('api-keys')
@UseGuards(ThrottlerGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @ProtectApiKeys()
  @ApiOperation({
    summary: 'Create a new API key',
    description:
      'Creates a new API key for the authenticated merchant. The key will be shown only once. Limited by subscription plan.',
  })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Plan limit exceeded - upgrade required',
  })
  async createApiKey(@Body() dto: CreateApiKeyDto, @Req() req: Request) {
    return this.apiKeysService.createApiKey(dto, req);
  }

  @Get()
  @ApiOperation({
    summary: 'List all API keys',
    description: 'Returns all API keys for the authenticated merchant.',
  })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listApiKeys(@Req() req: Request) {
    return this.apiKeysService.listApiKeys(req);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get API key details',
    description: 'Returns details for a specific API key.',
  })
  @ApiResponse({
    status: 200,
    description: 'API key details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getApiKey(@Param('id') id: string, @Req() req: Request) {
    return this.apiKeysService.getApiKey(id, req);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Revoke an API key',
    description: 'Revokes an API key, making it unusable for future requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeApiKey(@Param('id') id: string, @Req() req: Request) {
    return this.apiKeysService.revokeApiKey(id, req);
  }
}
