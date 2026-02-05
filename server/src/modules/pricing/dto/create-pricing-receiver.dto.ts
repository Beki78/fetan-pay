import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TransactionProvider } from '@prisma/client';

export class CreatePricingReceiverDto {
  @ApiProperty({
    description: 'Payment provider',
    enum: TransactionProvider,
    example: 'CBE',
  })
  @IsEnum(TransactionProvider)
  provider: TransactionProvider;

  @ApiProperty({
    description: 'Receiver account number',
    example: '1000675169601',
  })
  @IsString()
  receiverAccount: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'MIKYAS MULAT ASMARE',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiProperty({
    description: 'Display label for the account',
    example: 'FetanPay Pricing - CBE',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiverLabel?: string;

  @ApiProperty({
    description: 'Account status',
    example: 'ACTIVE',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string = 'ACTIVE';
}

export class UpdatePricingReceiverDto extends CreatePricingReceiverDto {}
