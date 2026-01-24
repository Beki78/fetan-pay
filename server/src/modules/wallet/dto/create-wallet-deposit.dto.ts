import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { TransactionProvider } from '@prisma/client';

export class CreateWalletDepositDto {
  @ApiProperty({
    description: 'Deposit amount',
    example: 100.0,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Payment provider',
    enum: TransactionProvider,
    example: 'CBE',
  })
  @IsEnum(TransactionProvider)
  provider: TransactionProvider;

  @ApiProperty({
    description: 'Receiver account ID',
    example: 'uuid-of-receiver-account',
  })
  @IsString()
  receiverAccountId: string;
}

