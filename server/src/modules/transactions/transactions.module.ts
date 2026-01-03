import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { VerifierModule } from '../verifier/verifier.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [PrismaModule, VerifierModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
