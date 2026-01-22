import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'merchant@example.com',
  })
  @IsEmail()
  toEmail: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to FetanPay!',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Email content (HTML supported)',
    example: '<p>Hello {{merchantName}}, welcome to FetanPay!</p>',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Email template ID to use',
    example: 'uuid-template-id',
  })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Merchant ID if this email is related to a specific merchant',
    example: 'uuid-merchant-id',
  })
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Template variables for substitution',
    example: { merchantName: 'John Doe', loginUrl: 'https://admin.fetanpay.et' },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}