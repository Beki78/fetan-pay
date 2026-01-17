import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({
    description: 'Merchant ID',
    example: 'merchant-uuid',
  })
  @IsString()
  merchantId: string;

  @ApiProperty({
    description: 'Adjustment amount (positive to add, negative to subtract)',
    example: -100.0,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Reason for adjustment',
    example: 'Refund for payment verification error',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

