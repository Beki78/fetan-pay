import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { MerchantUsersModule } from '../merchant-users/merchant-users.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule, MerchantUsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
