import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateIPAddressDto {
  @ApiProperty({
    description: 'IP address or CIDR range',
    example: '192.168.1.100',
    required: false,
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({
    description: 'Optional description for the IP address',
    example: 'Office network',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    description: 'Status of the IP address',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
