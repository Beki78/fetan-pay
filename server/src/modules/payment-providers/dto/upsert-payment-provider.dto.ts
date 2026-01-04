import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export type ProviderStatusDto = 'ACTIVE' | 'COMING_SOON' | 'DISABLED';

export class UpsertPaymentProviderDto {
  @ApiProperty({
    enum: TransactionProvider,
    description:
      'Provider code; should match TransactionProvider enum (used by verification logic)',
  })
  @IsEnum(TransactionProvider)
  code!: TransactionProvider;

  @ApiProperty({ description: 'Display name', example: 'Commercial Bank of Ethiopia' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description:
      'Local logo filename under each frontend app public/images/banks (e.g. CBE.png, Telebirr.png)',
    example: 'CBE.png',
  })
  @IsOptional()
  @IsString()
  logoKey?: string;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'COMING_SOON', 'DISABLED'],
    default: 'COMING_SOON',
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'COMING_SOON', 'DISABLED'])
  status?: ProviderStatusDto;
}
