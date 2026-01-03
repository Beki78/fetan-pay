import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class SelfRegisterMerchantDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber('ET', { message: 'contactPhone must be a valid Ethiopian phone number' })
  contactPhone?: string;

  @ApiProperty({ description: 'Owner email' })
  @IsEmail()
  ownerEmail!: string;

  @ApiPropertyOptional({ description: 'Owner phone' })
  @IsOptional()
  @IsPhoneNumber('ET', { message: 'ownerPhone must be a valid Ethiopian phone number' })
  ownerPhone?: string;

  @ApiPropertyOptional({ description: 'Owner name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  ownerName?: string;
}
