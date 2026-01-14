import { Module } from '@nestjs/common';
import { MerchantAdminDashboardController } from './merchant-admin-dashboard.controller';
import { MerchantAdminDashboardService } from './merchant-admin-dashboard.service';
import { PrismaModule } from '../../../database/prisma.module';
import { MerchantUsersModule } from '../merchant-users/merchant-users.module';

@Module({
  imports: [PrismaModule, MerchantUsersModule],
  controllers: [MerchantAdminDashboardController],
  providers: [MerchantAdminDashboardService],
  exports: [MerchantAdminDashboardService],
})
export class MerchantAdminDashboardModule {}
