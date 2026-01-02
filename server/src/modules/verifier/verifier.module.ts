import { Module } from '@nestjs/common';
import { VerifyController } from './controllers/verify.controller';
import { VerificationService } from './services/verification.service';

@Module({
  imports: [],
  controllers: [VerifyController],
  providers: [VerificationService],
})
export class VerifierModule {}
