import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RevokeApiKeyDto {
  @ApiProperty({
    description: 'API key ID to revoke',
    example: 'uuid-of-api-key',
  })
  @IsString()
  id!: string;
}
