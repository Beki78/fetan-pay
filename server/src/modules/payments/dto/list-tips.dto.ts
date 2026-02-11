import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { TransactionProvider } from '@prisma/client';

export class ListTipsDto {
  @ApiPropertyOptional({ description: 'ISO date string (inclusive)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date string (inclusive)' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Filter by payment provider',
    enum: TransactionProvider,
  })
  @IsOptional()
  @IsEnum(TransactionProvider)
  provider?: TransactionProvider;

  @ApiPropertyOptional({
    description: 'Filter by verification status',
    enum: ['PENDING', 'VERIFIED', 'UNVERIFIED'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search by phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Search by customer name' })
  @IsOptional()
  @IsString()
  name?: string;

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
