import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionProvider } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'Expected amount for the order', example: 250 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expectedAmount!: number;

  @ApiPropertyOptional({ description: 'ISO currency code', example: 'ETB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Payment provider',
    enum: ['CBE', 'TELEBIRR', 'AWASH', 'BOA', 'DASHEN'],
    example: 'CBE',
  })
  @IsOptional()
  @IsEnum(TransactionProvider)
  provider?: TransactionProvider;

  @ApiPropertyOptional({
    description: 'Name of the payer',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  payerName?: string;
}
