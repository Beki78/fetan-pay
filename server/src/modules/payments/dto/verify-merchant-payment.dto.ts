import { ApiProperty } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class VerifyMerchantPaymentDto {
  @ApiProperty({ enum: TransactionProvider })
  @IsEnum(TransactionProvider)
  provider!: TransactionProvider;

  @ApiProperty({ description: 'Transaction reference from QR/manual entry' })
  @IsString()
  reference!: string;

  @ApiProperty({ description: 'Amount the customer claims to have paid', example: 250 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  claimedAmount!: number;

  @ApiProperty({
    required: false,
    description:
      'Optional raw QR payload. If provided, server may parse/extract reference in the future.',
  })
  @IsOptional()
  @IsString()
  qrData?: string;

  @ApiProperty({
    required: false,
    description: 'Optional tip amount given by the customer',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tipAmount?: number;
}
