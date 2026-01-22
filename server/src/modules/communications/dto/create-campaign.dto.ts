import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID, IsObject, IsDateString, IsArray } from 'class-validator';

export enum CampaignType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  BOTH = 'BOTH',
}

export enum AudienceSegmentType {
  ALL_MERCHANTS = 'ALL_MERCHANTS',
  PENDING_MERCHANTS = 'PENDING_MERCHANTS',
  ACTIVE_MERCHANTS = 'ACTIVE_MERCHANTS',
  BANNED_USERS = 'BANNED_USERS',
  INACTIVE_MERCHANTS = 'INACTIVE_MERCHANTS',
  HIGH_VOLUME_MERCHANTS = 'HIGH_VOLUME_MERCHANTS',
  NEW_SIGNUPS = 'NEW_SIGNUPS',
  MERCHANT_OWNERS = 'MERCHANT_OWNERS',
  WAITERS = 'WAITERS',
  CUSTOM_FILTER = 'CUSTOM_FILTER',
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Welcome New Merchants - Q1 2026',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Campaign type',
    enum: CampaignType,
    example: CampaignType.EMAIL,
  })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiPropertyOptional({
    description: 'Email subject (required for email campaigns)',
    example: 'Welcome to FetanPay!',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello {{merchantName}}, welcome to FetanPay!',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Email template ID to use',
    example: 'uuid-template-id',
  })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({
    description: 'Target audience segment',
    enum: AudienceSegmentType,
    example: AudienceSegmentType.ACTIVE_MERCHANTS,
  })
  @IsEnum(AudienceSegmentType)
  audienceSegment: AudienceSegmentType;

  @ApiPropertyOptional({
    description: 'Custom filters for CUSTOM_FILTER audience type',
    example: { status: 'ACTIVE', lastLoginDays: 30 },
  })
  @IsOptional()
  @IsObject()
  customFilters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Schedule campaign for later (ISO 8601)',
    example: '2026-01-25T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Template variables for substitution',
    example: { supportEmail: 'support@fetanpay.et', loginUrl: 'https://admin.fetanpay.et' },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}