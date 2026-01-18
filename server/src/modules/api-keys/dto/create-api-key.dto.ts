import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'User-friendly name for the API key',
    example: 'Production API Key',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional expiration date (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'API key scopes/permissions',
    example: ['payments:verify', 'payments:read'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
