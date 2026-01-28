import {
  Controller,
  Get,
  Post,
  Put,
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
import { IPAddressesService } from './ip-addresses.service';
import { CreateIPAddressDto } from './dto/create-ip-address.dto';
import { UpdateIPAddressDto } from './dto/update-ip-address.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('ip-addresses')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('ip-addresses')
@UseGuards(ThrottlerGuard)
export class IPAddressesController {
  constructor(private readonly ipAddressesService: IPAddressesService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a new IP address to whitelist',
    description:
      "Adds a new IP address or CIDR range to the merchant's whitelist.",
  })
  @ApiResponse({
    status: 201,
    description: 'IP address added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or duplicate IP',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createIPAddress(@Body() dto: CreateIPAddressDto, @Req() req: Request) {
    return this.ipAddressesService.createIPAddress(dto, req);
  }

  @Get()
  @ApiOperation({
    summary: 'List all whitelisted IP addresses',
    description: "Returns all IP addresses in the merchant's whitelist.",
  })
  @ApiResponse({
    status: 200,
    description: 'IP addresses retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listIPAddresses(@Req() req: Request) {
    return this.ipAddressesService.listIPAddresses(req);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get IP whitelisting status',
    description:
      'Returns the current IP whitelisting status and configured IP addresses.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP whitelisting status retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getIPWhitelistingStatus(@Req() req: Request) {
    return this.ipAddressesService.getIPWhitelistingStatus(req);
  }

  @Get('current-ip')
  @ApiOperation({
    summary: 'Get current client IP address',
    description:
      'Returns the current client IP address as detected by the server.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current IP address retrieved successfully',
  })
  async getCurrentIP(@Req() req: Request) {
    return this.ipAddressesService.getCurrentIP(req);
  }

  @Post('enable')
  @ApiOperation({
    summary: 'Enable IP whitelisting',
    description:
      'Enables IP whitelisting for the merchant. Only whitelisted IPs will be able to access the API.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP whitelisting enabled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enableIPWhitelisting(@Req() req: Request) {
    return this.ipAddressesService.enableIPWhitelisting(req);
  }

  @Post('disable')
  @ApiOperation({
    summary: 'Disable IP whitelisting',
    description:
      'Disables IP whitelisting for the merchant. All IPs will be allowed to access the API.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP whitelisting disabled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async disableIPWhitelisting(@Req() req: Request) {
    return this.ipAddressesService.disableIPWhitelisting(req);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get IP address details',
    description: 'Returns details for a specific IP address.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP address details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'IP address not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getIPAddress(@Param('id') id: string, @Req() req: Request) {
    return this.ipAddressesService.getIPAddress(id, req);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an IP address',
    description: 'Updates an existing IP address in the whitelist.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP address updated successfully',
  })
  @ApiResponse({ status: 404, description: 'IP address not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateIPAddress(
    @Param('id') id: string,
    @Body() dto: UpdateIPAddressDto,
    @Req() req: Request,
  ) {
    return this.ipAddressesService.updateIPAddress(id, dto, req);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an IP address',
    description: 'Removes an IP address from the whitelist.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP address deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'IP address not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteIPAddress(@Param('id') id: string, @Req() req: Request) {
    return this.ipAddressesService.deleteIPAddress(id, req);
  }
}
