import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyCbeDto {
  @ApiProperty({
    example: 'FT12345678',
    description: 'Commercial Bank of Ethiopia transaction ID (starts with FT).',
  })
  reference: string;

  @ApiProperty({
    example: '12345',
    description: 'Customer account suffix (exactly 5 digits).',
  })
  accountSuffix: string;
}

export class VerifyTelebirrDto {
  @ApiProperty({
    example: 'CLU7E7C9DH',
    description: 'Telebirr transaction reference to verify.',
  })
  reference: string;
}

export class VerifyDashenDto {
  @ApiProperty({
    example: 'DSH212345',
    description: 'Dashen Bank transaction reference to verify.',
  })
  transactionReference: string;
}

export class VerifyAbyssiniaDto {
  @ApiProperty({
    example: 'ABB123456',
    description: 'Abyssinia Bank reference to verify.',
  })
  reference: string;

  @ApiProperty({
    example: '12345',
    description: 'Five-digit suffix attached to Abyssinia Bank references.',
  })
  suffix: string;
}

export class VerifyCbeBirrDto {
  @ApiProperty({
    example: '1234567890',
    description: 'CBE Birr receipt number to verify.',
  })
  receiptNumber: string;

  @ApiProperty({
    example: '251911123456',
    description: 'Ethiopian telebirr phone number attached to the receipt.',
  })
  phoneNumber: string;

  @ApiPropertyOptional({
    example: 'optional-api-key',
    description:
      'Optional API key when calling internally from another service.',
  })
  apiKey?: string;
}

export class VerifyCbeSmartDto {
  @ApiProperty({
    example: 'FT25362L3FT732348645',
    description:
      'CBE reference to verify using the smart strategy (no suffix required).',
  })
  reference: string;
}

export class VerifyAbyssiniaSmartDto {
  @ApiProperty({
    example: 'FT23062669JJ',
    description:
      'Abyssinia Bank reference to verify via the smart helper (no suffix required).',
  })
  reference: string;
}

export class VerifyAwashSmartDto {
  @ApiProperty({
    example: '-2H1RJ8MA49-35BMW3',
    description: 'Awash Bank receipt token returned by the AwashPay URL.',
  })
  reference: string;
}

export class VerifyImageQueryDto {
  @ApiPropertyOptional({
    example: 'true',
    description:
      'Set to true to automatically verify the detected receipt without additional user input.',
  })
  autoVerify?: string;
}
