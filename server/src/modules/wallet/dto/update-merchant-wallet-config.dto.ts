import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateMerchantWalletConfigDto {
  @ApiProperty({
    description: 'Enable or disable wallet deduction',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  walletEnabled?: boolean;

  @ApiProperty({
    description: 'Charge type: PERCENTAGE or FIXED',
    example: 'PERCENTAGE',
    enum: ['PERCENTAGE', 'FIXED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PERCENTAGE', 'FIXED'])
  walletChargeType?: 'PERCENTAGE' | 'FIXED';

  @ApiProperty({
    description: 'Charge value (percentage e.g., 2.5 for 2.5%, or fixed amount e.g., 10.00)',
    example: 2.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  walletChargeValue?: number;

  @ApiProperty({
    description: 'Minimum balance threshold (optional)',
    example: 100.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  walletMinBalance?: number;
}

