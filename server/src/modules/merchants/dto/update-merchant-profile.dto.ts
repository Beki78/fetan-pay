import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateMerchantProfileDto {
  @ApiPropertyOptional({ description: 'Merchant business name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsPhoneNumber('ET', {
    message: 'contactPhone must be a valid Ethiopian phone number',
  })
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Tax Identification Number' })
  @IsOptional()
  @IsString()
  tin?: string;
}

