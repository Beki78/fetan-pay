import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'Webhook endpoint URL (must be HTTPS)',
    example: 'https://api.myapp.com/webhooks/fetanpay',
  })
  @IsString()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url!: string;

  @ApiProperty({
    description: 'Events to subscribe to',
    example: ['payment.verified', 'payment.unverified'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  events!: string[];

  @ApiPropertyOptional({
    description: 'Maximum number of retry attempts',
    example: 3,
    default: 3,
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
    default: 30000,
    minimum: 5000,
    maximum: 120000,
  })
  @IsOptional()
  @IsInt()
  @Min(5000)
  @Max(120000)
  timeout?: number;
}
