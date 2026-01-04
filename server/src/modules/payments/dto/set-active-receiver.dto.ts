import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class SetActiveReceiverDto {
  @ApiProperty({ enum: TransactionProvider })
  @IsEnum(TransactionProvider)
  provider!: TransactionProvider;

  @ApiProperty({
    description: 'Receiver account identifier (msisdn/account number/till/etc) used to match incoming transactions',
    example: '251911223344',
  })
  @IsString()
  receiverAccount!: string;

  @ApiPropertyOptional({ description: 'Human-friendly label for this receiver', example: 'Main TeleBirr Receiver' })
  @IsOptional()
  @IsString()
  receiverLabel?: string;

  @ApiPropertyOptional({ description: 'Receiver name as registered with provider/bank' })
  @IsOptional()
  @IsString()
  receiverName?: string;

  @ApiPropertyOptional({
    description: 'Optional provider-specific metadata (mock for now) stored as JSON',
    example: { branch: 'Bole', note: 'mock' },
  })
  @IsOptional()
  meta?: unknown;

  @ApiPropertyOptional({
    description:
      'Whether this receiver should be enabled immediately. If false, the receiver will be stored as INACTIVE (configured but disabled).',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
