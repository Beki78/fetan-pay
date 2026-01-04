import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SubmitPaymentClaimDto {
  @ApiProperty({ description: 'Order id this payment is for' })
  @IsString()
  orderId!: string;

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

  @ApiPropertyOptional({ description: 'Optional tip amount', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tipAmount?: number;
}
