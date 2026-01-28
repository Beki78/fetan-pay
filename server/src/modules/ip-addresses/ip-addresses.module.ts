import { Module } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IPAddressesController } from './ip-addresses.controller';
import { IPAddressesService } from './ip-addresses.service';
import { MerchantUsersService } from '../merchant-users/merchant-users.service';

@Module({
  controllers: [IPAddressesController],
  providers: [IPAddressesService, PrismaService, MerchantUsersService],
  exports: [IPAddressesService],
})
export class IPAddressesModule {}
