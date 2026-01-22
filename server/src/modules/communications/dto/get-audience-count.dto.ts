import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { AudienceSegmentType } from './create-campaign.dto';

export class GetAudienceCountDto {
  @ApiProperty({
    description: 'Audience segment type',
    enum: AudienceSegmentType,
    example: AudienceSegmentType.ACTIVE_MERCHANTS,
  })
  @IsEnum(AudienceSegmentType)
  segment: AudienceSegmentType;

  @ApiPropertyOptional({
    description: 'Custom filters for CUSTOM_FILTER segment type',
    example: { status: 'ACTIVE', lastLoginDays: 30 },
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}