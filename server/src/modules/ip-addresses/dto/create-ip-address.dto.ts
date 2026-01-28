import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateIPAddressDto {
  @ApiProperty({
    description: 'IP address or CIDR range',
    example: '192.168.1.100',
    examples: {
      ipv4: {
        value: '192.168.1.100',
        description: 'Single IPv4 address',
      },
      ipv4_cidr: {
        value: '192.168.1.0/24',
        description: 'IPv4 CIDR range',
      },
      ipv6: {
        value: '2001:db8::1',
        description: 'Single IPv6 address',
      },
      ipv6_cidr: {
        value: '2001:db8::/32',
        description: 'IPv6 CIDR range',
      },
    },
  })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({
    description: 'Optional description for the IP address',
    example: 'Office network',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
