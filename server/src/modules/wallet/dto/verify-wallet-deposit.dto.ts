import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { TransactionProvider } from '@prisma/client';

export class VerifyWalletDepositDto {
  @ApiProperty({
    description: 'Payment provider (CBE, TELEBIRR, AWASH, BOA, DASHEN)',
    enum: TransactionProvider,
    example: 'CBE',
  })
  @IsEnum(TransactionProvider)
  provider: TransactionProvider;

  @ApiProperty({
    description: 'Transaction reference from bank/provider',
    example: 'CBE-20250115-ABC123',
  })
  @IsString()
  reference: string;
}

