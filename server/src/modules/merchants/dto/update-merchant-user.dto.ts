import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum MerchantUserRole {
  MERCHANT_OWNER = 'MERCHANT_OWNER',
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  SALES = 'SALES',
  WAITER = 'WAITER',
}

export class UpdateMerchantUserDto {
  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Merchant role (role within merchant account)',
    enum: MerchantUserRole,
  })
  @IsOptional()
  @IsEnum(MerchantUserRole)
  role?: MerchantUserRole;
}
