import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SmsLogStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  QUEUED = 'QUEUED',
}

export class ListSmsLogsDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
  })
  @IsOptional()
  @IsString()
  pageSize?: string;

  @ApiPropertyOptional({
    description: 'Filter by merchant ID',
    example: 'merchant-uuid',
  })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by SMS status',
    enum: SmsLogStatus,
    example: SmsLogStatus.SENT,
  })
  @IsOptional()
  @IsEnum(SmsLogStatus)
  status?: SmsLogStatus;

  @ApiPropertyOptional({
    description: 'Filter by template ID',
    example: 'template-uuid',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Search in phone numbers and message content',
    example: '+251911234567',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter from date (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (ISO string)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}