import { ApiProperty } from '@nestjs/swagger';
import { TransactionProvider } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class DisableReceiverDto {
  @ApiProperty({ enum: TransactionProvider })
  @IsEnum(TransactionProvider)
  provider!: TransactionProvider;
}
