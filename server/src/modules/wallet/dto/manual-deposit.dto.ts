import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ManualDepositDto {
  @ApiProperty({
    description: 'Merchant ID to deposit funds to',
    example: 'merchant-uuid',
  })
  @IsString()
  merchantId: string;

  @ApiProperty({
    description: 'Amount to deposit',
    example: 5000.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Optional description for the deposit',
    example: 'Initial wallet deposit',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

