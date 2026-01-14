import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class QrLoginDto {
  @ApiProperty({
    description: 'Encrypted QR code data scanned from QR code',
  })
  @IsString()
  @IsNotEmpty()
  qrData: string;

  @ApiProperty({
    description: 'Origin/domain where QR code was scanned (for validation)',
  })
  @IsString()
  @IsNotEmpty()
  origin: string;
}
