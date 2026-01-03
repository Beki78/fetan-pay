import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveMerchantDto {
  @ApiPropertyOptional({
    description: 'Admin user id or name approving the merchant',
  })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}
