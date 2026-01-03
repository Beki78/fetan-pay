import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SetMerchantUserStatusDto {
  @ApiProperty({ description: 'Actor/admin id or email (for auditing)' })
  @IsString()
  actionBy: string;
}
