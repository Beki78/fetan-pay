import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../../database/prisma.module';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
