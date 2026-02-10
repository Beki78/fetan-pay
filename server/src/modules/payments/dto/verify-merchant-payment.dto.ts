import { ApiProperty } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min, ValidateIf, IsNotEmpty } from 'class-validator';

export enum TransferType {
  SAME_BANK = 'SAME_BANK',
  INTER_BANK = 'INTER_BANK',
}

export class VerifyMerchantPaymentDto {
  @ApiProperty({ 
    enum: TransferType,
    description: 'Type of transfer: SAME_BANK (direct) or INTER_BANK (cross-bank)',
    example: TransferType.SAME_BANK,
  })
  @IsEnum(TransferType)
  transferType!: TransferType;

  @ApiProperty({ 
    enum: TransactionProvider,
    required: false,
    description: 'Sender bank (required for INTER_BANK transfers)',
    example: TransactionProvider.CBE,
  })
  @ValidateIf((o) => o.transferType === TransferType.INTER_BANK)
  @IsNotEmpty({ message: 'Sender bank is required for inter-bank transfers' })
  @IsEnum(TransactionProvider)
  senderBank?: TransactionProvider;

  @ApiProperty({ 
    enum: TransactionProvider,
    description: 'Receiver bank (merchant account bank)',
    example: TransactionProvider.CBE,
  })
  @IsEnum(TransactionProvider)
  receiverBank!: TransactionProvider;

  @ApiProperty({ description: 'Transaction reference from QR/manual entry' })
  @IsString()
  reference!: string;

  @ApiProperty({
    required: false,
    description:
      'Amount the customer claims to have paid. If not provided, amount from bank response will be used.',
    example: 250,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  claimedAmount?: number;

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
