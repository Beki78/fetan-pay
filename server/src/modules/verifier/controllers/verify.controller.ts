import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'fs';
import type { File as MulterFile } from 'multer';
import { VerificationService } from '../services/verification.service';
import {
  VerifyAbyssiniaDto,
  VerifyAbyssiniaSmartDto,
  VerifyAwashSmartDto,
  VerifyCbeBirrDto,
  VerifyCbeDto,
  VerifyCbeSmartDto,
  VerifyDashenDto,
  VerifyImageQueryDto,
  VerifyTelebirrDto,
} from '../dtos/verification-requests.dto';

@ApiTags('verification')
@AllowAnonymous()
@Controller('verifier')
export class VerifyController {
  constructor(private readonly verificationService: VerificationService) {}
  private mistral: any | null = null;

  private async getMistralClient() {
    if (this.mistral) return this.mistral;

    try {
      const { Mistral } = require('@mistralai/mistralai');
      this.mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY ?? '' });
      return this.mistral;
    } catch (error) {
      return null;
    }
  }

  @Get('/')
  root() {
    return {
      name: 'Payment Verification API',
      version: '2.1.0',
      endpoints: [
        '/verify-cbe',
        '/verify-telebirr',
        '/verify-dashen',
        '/verify-abyssinia',
        '/verify-cbebirr',
        '/verify-image',
        '/verify-cbe-smart',
        '/verify-abyssinia-smart',
        '/verify-awash-smart',
      ],
    };
  }

  @Get('/health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post('/verify-cbe')
  @ApiOperation({ summary: 'Verify a CBE transaction' })
  @ApiResponse({
    status: 200,
    description: 'Resolver for valid CBE transactions.',
  })
  @ApiBody({ type: VerifyCbeDto })
  async verifyCbe(@Body() body: VerifyCbeDto) {
    const { reference, accountSuffix } = body;
    if (!reference || !accountSuffix) {
      return { success: false, error: 'Missing reference or accountSuffix.' };
    }

    return await this.verificationService.verifyCbe(reference, accountSuffix);
  }

  @Get('/verify-cbe')
  @ApiOperation({ summary: 'Verify a CBE transaction using query parameters' })
  @ApiQuery({
    name: 'reference',
    required: true,
    description: 'CBE transaction reference (starts with FT).',
  })
  @ApiQuery({
    name: 'accountSuffix',
    required: true,
    description: 'Five-digit CBE account suffix.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resolver for valid CBE transactions.',
  })
  async verifyCbeGet(
    @Query('reference') reference?: string,
    @Query('accountSuffix') accountSuffix?: string,
  ) {
    if (!reference || !accountSuffix) {
      return { success: false, error: 'Missing reference or accountSuffix.' };
    }

    return await this.verificationService.verifyCbe(reference, accountSuffix);
  }

  @Post('/verify-telebirr')
  @ApiOperation({ summary: 'Verify a Telebirr receipt reference' })
  @ApiBody({ type: VerifyTelebirrDto })
  @ApiResponse({ status: 200, description: 'Telebirr verification result.' })
  async verifyTelebirrRoute(@Body() body: VerifyTelebirrDto) {
    const { reference } = body;
    if (!reference) {
      return { success: false, error: 'Missing reference.' };
    }

    const result = await this.verificationService.verifyTelebirr(reference);
    if (!result) {
      return {
        success: false,
        error: 'Receipt not found or could not be processed.',
      };
    }

    return { success: true, data: result };
  }

  @Post('/verify-dashen')
  @ApiOperation({ summary: 'Verify a Dashen Bank transaction reference' })
  @ApiBody({ type: VerifyDashenDto })
  @ApiResponse({ status: 200, description: 'Dashen verification result.' })
  async verifyDashenRoute(@Body() body: VerifyDashenDto) {
    const { transactionReference } = body;
    if (!transactionReference) {
      return { success: false, error: 'Missing transactionReference.' };
    }

    return await this.verificationService.verifyDashen(transactionReference);
  }

  @Post('/verify-abyssinia')
  @ApiOperation({ summary: 'Verify an Abyssinia Bank reference' })
  @ApiBody({ type: VerifyAbyssiniaDto })
  @ApiResponse({
    status: 200,
    description: 'Abyssinia bank verification result.',
  })
  async verifyAbyssiniaRoute(@Body() body: VerifyAbyssiniaDto) {
    const { reference, suffix } = body;
    if (!reference || !suffix) {
      return {
        success: false,
        error: 'Missing required parameters: reference and suffix are required',
      };
    }

    if (typeof reference !== 'string' || typeof suffix !== 'string') {
      return {
        success: false,
        error: 'Invalid parameter types: reference and suffix must be strings',
      };
    }

    if (suffix.length !== 5 || !/^\d{5}$/.test(suffix)) {
      return {
        success: false,
        error: 'Invalid suffix: must be exactly 5 digits',
      };
    }

    return await this.verificationService.verifyAbyssinia(reference, suffix);
  }

  @Get('/verify-abyssinia')
  async verifyAbyssiniaGet(
    @Query('reference') reference?: string,
    @Query('suffix') suffix?: string,
  ) {
    if (!reference || !suffix) {
      return {
        success: false,
        error:
          'Missing required query parameters: reference and suffix are required',
      };
    }

    if (typeof reference !== 'string' || typeof suffix !== 'string') {
      return {
        success: false,
        error: 'Invalid parameter types: reference and suffix must be strings',
      };
    }

    if (suffix.length !== 5 || !/^\d{5}$/.test(suffix)) {
      return {
        success: false,
        error: 'Invalid suffix: must be exactly 5 digits',
      };
    }

    return await this.verificationService.verifyAbyssinia(reference, suffix);
  }

  @Post('/verify-cbebirr')
  @ApiOperation({ summary: 'Verify a CBE Birr receipt' })
  @ApiBody({ type: VerifyCbeBirrDto })
  @ApiResponse({ status: 200, description: 'CBE Birr verification result.' })
  async verifyCbeBirr(
    @Body()
    body: VerifyCbeBirrDto,
    @Query('receiptNumber') receiptNumberQuery?: string,
    @Query('phoneNumber') phoneNumberQuery?: string,
    @Query('apiKey') apiKeyQuery?: string,
  ) {
    const receiptNumber = body.receiptNumber ?? receiptNumberQuery;
    const phoneNumber = body.phoneNumber ?? phoneNumberQuery;

    if (!receiptNumber) {
      return { success: false, error: 'Receipt number is required' };
    }

    if (!phoneNumber) {
      return { success: false, error: 'Phone number is required' };
    }

    if (!/^251\d{9}$/.test(phoneNumber)) {
      return {
        success: false,
        error:
          'Invalid Ethiopian phone number format. Must start with 251 and be 12 digits total',
      };
    }

    const effectiveApiKey = body.apiKey ?? apiKeyQuery ?? '';
    return await this.verificationService.verifyCbeBirr(
      receiptNumber,
      phoneNumber,
      effectiveApiKey,
    );
  }

  @Post('/verify-cbe-smart')
  @ApiOperation({ summary: 'Verify a CBE transaction with the smart strategy' })
  @ApiResponse({ status: 200, description: 'Smart CBE verification result.' })
  @ApiBody({ type: VerifyCbeSmartDto })
  async verifyCbeSmartRoute(@Body() body: VerifyCbeSmartDto) {
    const { reference } = body;
    if (!reference) {
      return { success: false, error: 'Missing reference.' };
    }

    return await this.verificationService.verifyCbeSmart(reference);
  }

  @Post('/verify-abyssinia-smart')
  @ApiOperation({
    summary: 'Verify an Abyssinia reference with the smart strategy',
  })
  @ApiResponse({
    status: 200,
    description: 'Smart Abyssinia verification result.',
  })
  @ApiBody({ type: VerifyAbyssiniaSmartDto })
  async verifyAbyssiniaSmartRoute(@Body() body: VerifyAbyssiniaSmartDto) {
    const { reference } = body;
    if (!reference) {
      return { success: false, error: 'Missing reference.' };
    }

    return await this.verificationService.verifyAbyssiniaSmart(reference);
  }

  @Post('/verify-awash-smart')
  @ApiOperation({
    summary: 'Verify an Awash Bank receipt with the smart strategy',
  })
  @ApiResponse({
    status: 200,
    description: 'Smart Awash verification result.',
  })
  @ApiBody({ type: VerifyAwashSmartDto })
  async verifyAwashSmartRoute(@Body() body: VerifyAwashSmartDto) {
    const { reference } = body;
    if (!reference) {
      return { success: false, error: 'Missing reference.' };
    }

    return await this.verificationService.verifyAwashSmart(reference);
  }

  @Post('/verify-image')
  @ApiOperation({
    summary: 'Analyze a receipt image and optionally auto verify it',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        suffix: {
          type: 'string',
          description:
            'Account suffix required when auto verifying a CBE receipt.',
          example: '12345',
        },
      },
    },
  })
  @ApiQuery({
    name: 'autoVerify',
    required: false,
    description: 'Set to true to immediately verify the detected receipt.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async verifyImage(
    @UploadedFile() file: MulterFile,
    @Query() query: VerifyImageQueryDto,
    @Body('suffix') accountSuffix?: string,
  ) {
    if (!file) {
      return { error: 'No file uploaded' };
    }

    const buffer =
      file.buffer ?? (file.path ? fs.readFileSync(file.path) : null);
    if (!buffer) {
      return { error: 'Failed to read uploaded file' };
    }

    const base64Image = buffer.toString('base64');

    const mistral = await this.getMistralClient();
    if (!mistral) {
      return { error: 'Mistral client is not available' };
    }

    const prompt = `
You are a payment receipt analyzer. Based on the uploaded image, determine which provider issued the receipt and extract its reference/transaction number.

Providers to recognize:
- Commercial Bank of Ethiopia (CBE)
- Telebirr
- Awash Bank
- Bank of Abyssinia (BOA)
- Dashen Bank

Visual cues (guidelines, not absolute):
- CBE: Purple header with "Commercial Bank of Ethiopia", structured table, references often start with "FT".
- Telebirr: Typically green, can show a minus sign before the amount, transaction numbers can start with "CE".
- Awash: Orange/amber branding, Awash logo/stamp, header often says "AwashBank" or Awash Birr; may show "Transfer successful" and a numeric Transaction ID field.
- BOA (Bank of Abyssinia): Yellow/gold tones and Abyssinia logo; may show "Abyssinia" in the header/body.
- Dashen: Blue-themed UI with Dashen branding/logo; may say "Dashen Bank"; look for fields like "Transaction Ref" or "FT Ref" (e.g., values like LTWS... or 659L... as seen on Dashen receipts).

Extraction hints:
- Always return a single canonical reference string when visible (e.g., FT..., CE..., numeric transaction id from the receipt, or the most specific transaction reference shown).
- If multiple IDs appear, prefer the FT reference when present (e.g., fields labeled "FT Ref" or values starting with FT/659L...). When both "Transaction Ref" and "FT Ref" are shown (as on Dashen receipts), return the FT Ref value, not the Transaction Ref.
- Do not invent a reference; leave it out if truly missing.

Return this JSON format exactly:
{
  "type": "cbe" | "telebirr" | "awash" | "boa" | "dashen",
  "reference"?: "string"
}
    `.trim();

    try {
      const chatResponse = await mistral.chat.complete({
        model: 'pixtral-12b',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                imageUrl: `data:image/jpeg;base64,${base64Image}`,
              },
            ],
          },
        ],
        responseFormat: { type: 'json_object' },
      });

      const messageContent = chatResponse.choices?.[0]?.message?.content;
      if (!messageContent || typeof messageContent !== 'string') {
        return { error: 'Invalid OCR response' };
      }

      const result = JSON.parse(messageContent);
      const autoVerifyFlag = query.autoVerify === 'true';

      const bank = result.type as
        | 'cbe'
        | 'telebirr'
        | 'awash'
        | 'boa'
        | 'dashen'
        | undefined;
      const reference: string | undefined =
        result.reference || result.transaction_id || result.transaction_number;

      if (!bank) {
        return { error: 'Unknown or unrecognized receipt type' };
      }

      const forwardMap: Record<
        string,
        {
          forward: string;
          needsSuffix?: boolean;
          verifier: (ref: string, suffix?: string) => Promise<any>;
        }
      > = {
        telebirr: {
          forward: '/verify-telebirr',
          verifier: (ref) => this.verificationService.verifyTelebirr(ref),
        },
        cbe: {
          forward: '/verify-cbe',
          needsSuffix: true,
          verifier: (ref, suffix) =>
            this.verificationService.verifyCbe(ref, suffix ?? ''),
        },
        awash: {
          forward: '/verify-awash-smart',
          verifier: (ref) => this.verificationService.verifyAwashSmart(ref),
        },
        boa: {
          forward: '/verify-abyssinia-smart',
          verifier: (ref) => this.verificationService.verifyAbyssiniaSmart(ref),
        },
        dashen: {
          forward: '/verify-dashen',
          verifier: (ref) => this.verificationService.verifyDashen(ref),
        },
      };

      const mapping = forwardMap[bank];
      if (!mapping) {
        return { error: 'Unsupported receipt type' };
      }

      if (!reference) {
        return { error: 'Reference not found in the receipt' };
      }

      if (!autoVerifyFlag) {
        return {
          type: bank,
          reference,
          forward_to: mapping.forward,
          accountSuffix: mapping.needsSuffix ? 'required_from_user' : undefined,
        };
      }

      if (mapping.needsSuffix && !accountSuffix) {
        return {
          error: 'Account suffix is required for this bank in autoVerify mode',
        };
      }

      const details = await mapping.verifier(reference, accountSuffix);
      return {
        verified: true,
        type: bank,
        reference,
        details,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected error processing image',
      };
    } finally {
      if (file?.path) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          // ignore cleanup errors
        }
      }
    }
  }
}
