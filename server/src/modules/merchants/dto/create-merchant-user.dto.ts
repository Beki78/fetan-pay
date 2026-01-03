import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMerchantUserDto {
  @ApiProperty({ description: 'Name of the employee/user' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email (used as username for auth)' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for Better Auth user', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Merchant role (defaults to EMPLOYEE)' })
  @IsOptional()
  @IsString()
  role?: string;
}
