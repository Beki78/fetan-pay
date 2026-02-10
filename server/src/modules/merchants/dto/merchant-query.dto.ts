import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { MerchantStatusDto } from './admin-create-merchant.dto';

export class MerchantQueryDto {
  @ApiPropertyOptional({
    enum: MerchantStatusDto,
    description: 'Filter by merchant status',
  })
  @IsOptional()
  @IsEnum(MerchantStatusDto)
  status?: MerchantStatusDto;

  @ApiPropertyOptional({
    description: 'Case-insensitive search on name/tin/contactEmail',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  pageSize?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by merchant owner email verification status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  ownerEmailVerified?: boolean;
}
