import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class VerifyFromQrDto {
  @ApiProperty({ description: 'Raw QR URL to parse for transaction details' })
  @IsUrl({}, { message: 'qrUrl must be a valid URL' })
  qrUrl!: string;

  @ApiPropertyOptional({
    enum: TransactionProvider,
    description:
      'Optional provider hint; if omitted, the provider is inferred from the URL',
  })
  @IsOptional()
  @IsEnum(TransactionProvider)
  provider?: TransactionProvider;

  @ApiPropertyOptional({
    description:
      'Optional manual reference; overrides extraction from the QR when provided',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description:
      'Five-digit account suffix required when verifying CBE transactions',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  @Length(5, 5)
  accountSuffix?: string;
}
