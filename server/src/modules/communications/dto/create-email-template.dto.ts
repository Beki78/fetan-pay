import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum EmailTemplateCategory {
  WELCOME = 'WELCOME',
  APPROVAL = 'APPROVAL',
  SECURITY = 'SECURITY',
  MARKETING = 'MARKETING',
  REMINDER = 'REMINDER',
  NOTIFICATION = 'NOTIFICATION',
}

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Welcome New Merchant',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Template category',
    enum: EmailTemplateCategory,
    example: EmailTemplateCategory.WELCOME,
  })
  @IsEnum(EmailTemplateCategory)
  category: EmailTemplateCategory;

  @ApiProperty({
    description: 'Email subject template',
    example: 'Welcome to FetanPay, {{merchantName}}!',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Email content template (HTML supported)',
    example: '<p>Hello {{merchantName}}, welcome to FetanPay!</p><p>Your login URL: {{loginUrl}}</p>',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Available template variables',
    example: ['merchantName', 'loginUrl', 'supportEmail'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}