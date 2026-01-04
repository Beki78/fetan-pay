import { Module } from '@nestjs/common';
import { MerchantUsersController } from './merchant-users.controller';
import { MerchantUsersService } from './merchant-users.service';

@Module({
  controllers: [MerchantUsersController],
  providers: [MerchantUsersService],
  exports: [MerchantUsersService],
})
export class MerchantUsersModule {}
