import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TransactionProvider } from '@prisma/client';

export class VerifyPricingPaymentDto {
  @ApiProperty({
    description: 'Billing transaction ID',
    example: 'txn-123',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: TransactionProvider,
    example: 'CBE',
  })
  @IsEnum(TransactionProvider)
  provider: TransactionProvider;

  @ApiProperty({
    description: 'Payment reference from bank',
    example: 'FT24123ABC456',
  })
  @IsString()
  paymentReference: string;

  @ApiProperty({
    description: 'Receiver account ID used for payment',
    example: 'receiver-123',
  })
  @IsString()
  receiverAccountId: string;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
