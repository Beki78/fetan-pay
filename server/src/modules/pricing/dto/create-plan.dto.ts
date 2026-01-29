import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Starter Plan' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for small businesses and startups',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Monthly price in ETB', example: 1740 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle = BillingCycle.MONTHLY;

  @ApiProperty({
    description: 'Verification limit per month (null for unlimited)',
    example: 1000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  verificationLimit?: number;

  @ApiProperty({
    description: 'API requests per minute',
    example: 60,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  apiLimit?: number = 60;

  @ApiProperty({
    description: 'Array of plan features',
    example: ['Full API access', 'Vendor dashboard', 'Basic analytics'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    description: 'Mark as popular plan',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean = false;

  @ApiProperty({
    description: 'Display order for sorting',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  displayOrder?: number = 1;
}
