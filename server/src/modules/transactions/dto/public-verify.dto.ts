import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionProvider } from '@prisma/client';
import { Type } from 'class-transformer';

export class PublicVerifyDto {
  @ApiProperty({
    description: 'Transaction ID or reference',
    example: 'TXNKHHXNNPQFS',
  })
  @IsString()
  transactionId!: string;

  @ApiProperty({
    description: 'Bank transaction reference from receipt',
    example: 'FT25346B61Q5',
  })
  @IsString()
  reference!: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: TransactionProvider,
    example: 'CBE',
  })
  @IsEnum(TransactionProvider)
  provider!: TransactionProvider;

  @ApiPropertyOptional({
    description: 'Optional tip amount',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tipAmount?: number;
}

