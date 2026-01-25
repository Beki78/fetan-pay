import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../../database/prisma.module';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { QrCodeService } from './qr-code.service';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [PrismaModule, ConfigModule, WalletModule, NotificationModule],
  controllers: [MerchantsController],
  providers: [MerchantsService, QrCodeService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
