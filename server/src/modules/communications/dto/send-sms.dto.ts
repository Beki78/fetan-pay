import { IsString, IsOptional, IsPhoneNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiProperty({
    description: 'Recipient phone number',
    example: '+251911234567',
  })
  @IsString()
  toPhone: string;

  @ApiProperty({
    description: 'SMS message content',
    example: 'Hello {{merchantName}}, your account has been approved!',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Email template ID to use (content will be converted to plain text)',
    example: 'template-uuid',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Merchant ID (for logging purposes)',
    example: 'merchant-uuid',
  })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Template variables for substitution',
    example: {
      merchantName: 'John Doe',
      status: 'APPROVED',
      amount: '1000.00',
    },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Custom sender name (if configured)',
    example: 'FetanPay',
  })
  @IsOptional()
  @IsString()
  sender?: string;

  @ApiPropertyOptional({
    description: 'Callback URL for delivery status',
    example: 'https://api.fetanpay.et/webhooks/sms-status',
  })
  @IsOptional()
  @IsString()
  callback?: string;
}