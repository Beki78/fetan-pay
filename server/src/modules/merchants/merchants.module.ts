import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../../database/prisma.module';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { QrCodeService } from './qr-code.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [MerchantsController],
  providers: [MerchantsService, QrCodeService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
