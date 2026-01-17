import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionProvider } from '@prisma/client';

export class SetDepositReceiverDto {
  @ApiProperty({
    description: 'Payment provider',
    enum: TransactionProvider,
    example: 'CBE',
  })
  @IsEnum(TransactionProvider)
  provider: TransactionProvider;

  @ApiProperty({
    description: 'Receiver account number',
    example: '1000123456789',
  })
  @IsString()
  receiverAccount: string;

  @ApiProperty({
    description: 'Receiver account name',
    example: 'FetanPay Wallet Deposits',
  })
  @IsString()
  receiverName: string;

  @ApiProperty({
    description: 'Optional label for the receiver account',
    example: 'FetanPay Wallet Deposit - CBE',
    required: false,
  })
  @IsOptional()
  @IsString()
  receiverLabel?: string;

  @ApiProperty({
    description: 'Status (ACTIVE or INACTIVE)',
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

