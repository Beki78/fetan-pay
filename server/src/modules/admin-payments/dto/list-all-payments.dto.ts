import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider, TransactionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAllPaymentsDto {
  @ApiPropertyOptional({
    description: 'Filter by merchant ID',
    example: 'merchant-123',
  })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiPropertyOptional({ enum: TransactionProvider })
  @IsOptional()
  @IsEnum(TransactionProvider)
  provider?: TransactionProvider;

  @ApiPropertyOptional({
    enum: TransactionStatus,
    description: 'Transaction status (PENDING, VERIFIED, FAILED, EXPIRED)',
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    enum: ['QR', 'cash', 'bank'],
    description: 'Payment type: QR (verified), cash (logged), bank (logged)',
  })
  @IsOptional()
  @IsEnum(['QR', 'cash', 'bank'])
  paymentType?: 'QR' | 'cash' | 'bank';

  @ApiPropertyOptional({
    description: 'Search by transaction reference or payment reference',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Start date (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601 format)',
    example: '2024-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
