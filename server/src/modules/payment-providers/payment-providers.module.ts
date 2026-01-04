import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { PaymentProvidersController } from './payment-providers.controller';
import { PaymentProvidersService } from './payment-providers.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentProvidersController],
  providers: [PaymentProvidersService],
})
export class PaymentProvidersModule {}
