import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { AdminPaymentsController } from './admin.controller';
import { AdminPaymentsService } from './admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPaymentsController],
  providers: [AdminPaymentsService],
  exports: [AdminPaymentsService],
})
export class AdminPaymentsModule {}

