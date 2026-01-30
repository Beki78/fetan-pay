import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { BrandingService } from './branding.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ProtectCustomBranding } from '../../common/decorators/subscription-protection.decorator';

interface BrandingData {
  id: string | null;
  merchantId: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  displayName: string | null;
  tagline: string | null;
  showPoweredBy: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@ApiTags('branding')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('merchants/:merchantId/branding')
// Authentication is handled by Better Auth middleware
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @ApiOperation({ summary: 'Get branding settings for a merchant' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiResponse({
    status: 200,
    description: 'Branding settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        merchantId: { type: 'string' },
        logoUrl: { type: 'string', nullable: true },
        primaryColor: { type: 'string' },
        secondaryColor: { type: 'string' },
        displayName: { type: 'string', nullable: true },
        tagline: { type: 'string', nullable: true },
        showPoweredBy: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getBranding(
    @Param('merchantId') merchantId: string,
  ): Promise<BrandingData> {
    return this.brandingService.getBranding(merchantId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete branding settings for a merchant' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiResponse({
    status: 200,
    description: 'Branding settings deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Custom branding not available in your current plan',
  })
  @UseGuards(SubscriptionGuard)
  @ProtectCustomBranding()
  async deleteBranding(
    @Param('merchantId') merchantId: string,
  ): Promise<{ message: string }> {
    await this.brandingService.deleteBranding(merchantId);
    return { message: 'Branding deleted successfully' };
  }

  @Put()
  @ApiOperation({ summary: 'Update branding settings for a merchant' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (PNG, JPG, SVG, max 2MB)',
        },
        primaryColor: {
          type: 'string',
          description: 'Primary brand color (hex format)',
          example: '#5CFFCE',
        },
        secondaryColor: {
          type: 'string',
          description: 'Secondary brand color (hex format)',
          example: '#4F46E5',
        },
        displayName: {
          type: 'string',
          description: 'Custom display name',
          example: "ephrem debebe's Business",
        },
        tagline: {
          type: 'string',
          description: 'Business tagline',
          example: 'Fast & Reliable Payments',
        },
        showPoweredBy: {
          type: 'boolean',
          description: 'Show "Powered by FetanPay" badge',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Branding settings updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Custom branding not available in your current plan',
  })
  @UseGuards(SubscriptionGuard)
  @ProtectCustomBranding()
  @UseInterceptors(FileInterceptor('logo'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateBranding(
    @Param('merchantId') merchantId: string,
    @Body() updateDto: UpdateBrandingDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({
            fileType: /(image\/png|image\/jpeg|image\/jpg|image\/svg\+xml)/,
          }),
        ],
      }),
    )
    logoFile?: Express.Multer.File,
  ): Promise<BrandingData> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.brandingService.updateBranding(merchantId, updateDto, logoFile);
  }
}
