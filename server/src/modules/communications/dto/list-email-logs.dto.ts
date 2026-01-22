import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString, IsNumberString } from 'class-validator';

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export class ListEmailLogsDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
  })
  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @ApiPropertyOptional({
    description: 'Filter by merchant ID',
    example: 'uuid-merchant-id',
  })
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by email status',
    enum: EmailStatus,
    example: EmailStatus.SENT,
  })
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @ApiPropertyOptional({
    description: 'Filter by template ID',
    example: 'uuid-template-id',
  })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Search in email addresses or subjects',
    example: 'merchant@example.com',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Start date filter (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date filter (ISO 8601)',
    example: '2026-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}