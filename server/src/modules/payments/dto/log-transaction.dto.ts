import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class LogTransactionDto {
  @ApiProperty({
    description: 'Payment method type',
    enum: ['cash', 'bank'],
    example: 'cash',
  })
  @IsEnum(['cash', 'bank'])
  paymentMethod!: 'cash' | 'bank';

  @ApiProperty({
    description: 'Transaction amount',
    example: 250,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({
    description: 'Optional tip amount',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tipAmount?: number;

  @ApiPropertyOptional({
    description: 'Optional note about the transaction',
    example: 'Payment for order #12345',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description:
      'Bank provider (required when paymentMethod is "bank" and otherBankName is not provided)',
    enum: ['CBE', 'TELEBIRR', 'AWASH', 'BOA', 'DASHEN'],
    example: 'CBE',
  })
  @Transform(({ value, obj }: { value: unknown; obj: LogTransactionDto }) => {
    // If otherBankName is provided, ignore provider validation
    if (
      obj.otherBankName &&
      typeof obj.otherBankName === 'string' &&
      obj.otherBankName.trim()
    ) {
      return undefined;
    }
    // Convert empty string to undefined
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  @ValidateIf(
    (o: LogTransactionDto) => o.paymentMethod === 'bank' && !o.otherBankName,
  )
  @IsOptional()
  @IsEnum(TransactionProvider)
  provider?: TransactionProvider;

  @ApiPropertyOptional({
    description:
      'Other bank name (required when paymentMethod is "bank" and provider is not provided)',
    example: 'Custom Bank',
  })
  @Transform(({ value, obj }: { value: unknown; obj: LogTransactionDto }) => {
    // If provider is provided, ignore otherBankName validation
    if (obj.provider) {
      return undefined;
    }
    // Convert empty string to undefined
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  @ValidateIf(
    (o: LogTransactionDto) => o.paymentMethod === 'bank' && !o.provider,
  )
  @IsOptional()
  @IsString()
  otherBankName?: string;
}
