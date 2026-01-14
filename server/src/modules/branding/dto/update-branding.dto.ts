import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsHexColor, MaxLength } from 'class-validator';
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
    if (value === undefined || value === null) return undefined;
    if (value === 'true' || value === true || value === '1') return true;
    if (value === 'false' || value === false || value === '0' || value === '') return false;
    return Boolean(value);
  })
  showPoweredBy?: boolean;
}

