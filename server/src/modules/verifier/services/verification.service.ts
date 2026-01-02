import { Injectable } from '@nestjs/common';
import { verifyAbyssinia } from '../utils/strategies/verifyAbyssinia';
import { verifyAbyssiniaSmart } from '../utils/strategies/verifyAbyssiniaSmart';
import { verifyAwashSmart } from '../utils/strategies/verifyAwashSmart';
import { verifyCBEBirr } from '../utils/strategies/verifyCBEBirr';
import { verifyCBE } from '../utils/strategies/verifyCBE';
import { verifyCbeSmart } from '../utils/strategies/verifyCbeSmart';
import { verifyDashen } from '../utils/strategies/verifyDashen';
import { verifyTelebirr } from '../utils/strategies/verifyTelebirr';

@Injectable()
export class VerificationService {
  async verifyCbe(reference: string, accountSuffix: string) {
    return verifyCBE(reference, accountSuffix);
  }

  async verifyTelebirr(reference: string) {
    return verifyTelebirr(reference);
  }

  async verifyDashen(transactionReference: string) {
    return verifyDashen(transactionReference);
  }

  async verifyAbyssinia(reference: string, suffix: string) {
    return verifyAbyssinia(reference, suffix);
  }

  async verifyAbyssiniaSmart(reference: string) {
    return verifyAbyssiniaSmart(reference);
  }

  async verifyAwashSmart(reference: string) {
    return verifyAwashSmart(reference);
  }

  async verifyCbeBirr(
    receiptNumber: string,
    phoneNumber: string,
    apiKey: string,
  ) {
    return verifyCBEBirr(receiptNumber, phoneNumber, apiKey);
  }

  async verifyCbeSmart(reference: string) {
    return verifyCbeSmart(reference);
  }
}
