import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { PaymentProvidersController } from './payment-providers.controller';
import { PaymentProvidersService } from './payment-providers.service';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [PrismaModule, ApiKeysModule],
  controllers: [PaymentProvidersController],
  providers: [PaymentProvidersService],
})
export class PaymentProvidersModule {}
