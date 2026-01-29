import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateBillingTransactionDto {
  @ApiProperty({ description: 'Merchant ID' })
  @IsString()
  merchantId: string;

  @ApiProperty({ description: 'Plan ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: 'Subscription ID', required: false })
  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @ApiProperty({ description: 'Transaction amount in ETB', example: 1740 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Payment reference from external system',
    example: 'FT24001234567',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiProperty({
    description: 'Payment method used',
    example: 'Bank Transfer',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ description: 'Billing period start date' })
  @IsDateString()
  billingPeriodStart: string;

  @ApiProperty({ description: 'Billing period end date' })
  @IsDateString()
  billingPeriodEnd: string;

  @ApiProperty({
    description: 'Admin notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
