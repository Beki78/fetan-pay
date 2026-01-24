import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { WebhookStatus } from '@prisma/client';

export class UpdateWebhookDto {
  @ApiPropertyOptional({
    description: 'Webhook endpoint URL (must be HTTPS)',
    example: 'https://api.myapp.com/webhooks/fetanpay',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url?: string;

  @ApiPropertyOptional({
    description: 'Events to subscribe to',
    example: ['payment.verified', 'payment.unverified'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  events?: string[];

  @ApiPropertyOptional({
    description: 'Webhook status',
    enum: WebhookStatus,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @ApiPropertyOptional({
    description: 'Maximum number of retry attempts',
    example: 3,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxRetries?: number;

  @ApiPropertyOptional({
    description: 'Request timeout in milliseconds',
    example: 30000,
    minimum: 5000,
    maximum: 120000,
  })
  @IsOptional()
  @IsInt()
  @Min(5000)
  @Max(120000)
  timeout?: number;
}
