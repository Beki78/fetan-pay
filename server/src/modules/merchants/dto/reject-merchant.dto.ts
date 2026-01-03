import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectMerchantDto {
  @ApiPropertyOptional({ description: 'Admin identifier who rejected the merchant' })
  @IsOptional()
  @IsString()
  rejectedBy?: string;

  @ApiPropertyOptional({ description: 'Optional reason for rejection' })
  @IsOptional()
  @IsString()
  reason?: string;
}
