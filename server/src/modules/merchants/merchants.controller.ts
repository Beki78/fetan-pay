import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { SelfRegisterMerchantDto } from './dto/self-register-merchant.dto';
import { AdminCreateMerchantDto } from './dto/admin-create-merchant.dto';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('self-register')
  @ApiOperation({ summary: 'Merchant self-registration (creates pending merchant + owner)' })
  async selfRegister(@Body() body: SelfRegisterMerchantDto) {
    return this.merchantsService.selfRegister(body);
  }

  @Post()
  @ApiOperation({ summary: 'Admin creates a merchant (active or pending) with owner invite' })
  async adminCreate(@Body() body: AdminCreateMerchantDto) {
    return this.merchantsService.adminCreate(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant with users' })
  async getOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }
}
