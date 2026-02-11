import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsObject,
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
    description: 'Plan limits configuration (flexible JSON object)',
    example: {
      verifications_monthly: 1000,
      api_keys: 2,
      team_members: 5,
      webhooks: 3,
      bank_accounts: 5,
      custom_branding: false,
      advanced_analytics: true,
      export_functionality: true,
      transaction_history_days: 180,
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  limits?: Record<string, any> = {};

  @ApiProperty({
    description: 'Array of plan features for display',
    example: [
      '1,000 verifications/month',
      'Full API access',
      'Advanced analytics',
    ],
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

  @ApiProperty({
    description: 'Show plan on landing page',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  showOnLanding?: boolean = true;
}
