import { Module } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { PrismaService } from '../../../database/prisma.service';
import { MerchantUsersModule } from '../merchant-users/merchant-users.module';

@Module({
  imports: [MerchantUsersModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, PrismaService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
