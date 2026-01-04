import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
}
