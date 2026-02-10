import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsHexColor,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBrandingDto {
  @ApiPropertyOptional({
    description: 'Primary brand color (hex format)',
    example: '#5CFFCE',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Secondary brand color (hex format)',
    example: '#4F46E5',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional({
    description: 'Custom display name for the business',
    example: "ephrem debebe's Business",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Business tagline',
    example: 'Fast & Reliable Payments',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Show "Powered by FetanPay" badge',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle undefined/null - don't update this field
    if (value === undefined || value === null) return undefined;

    // Handle string values from FormData
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1') return true;
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === '')
        return false;
    }

    // Handle boolean values
    if (typeof value === 'boolean') return value;

    // Handle numeric values
    if (typeof value === 'number') return value !== 0;

    // Default: convert to boolean
    return Boolean(value);
  })
  @IsBoolean()
  showPoweredBy?: boolean;
}
