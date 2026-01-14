import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BrandingService {
  private readonly uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'branding',
  );

  constructor(private prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getBranding(merchantId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const branding = await (this.prisma as any).merchantBranding.findUnique({
      where: { merchantId },
    });

    if (!branding) {
      // Return default branding
      return {
        id: null,
        merchantId,
        logoUrl: null,
        primaryColor: '#5CFFCE',
        secondaryColor: '#4F46E5',
        displayName: null,
        tagline: null,
        showPoweredBy: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return branding;
  }

  async updateBranding(
    merchantId: string,
    updateDto: UpdateBrandingDto,
    logoFile?: Express.Multer.File,
  ) {
    // Verify merchant exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
    }

    // Handle logo upload
    let logoUrl: string | undefined;
    if (logoFile) {
      const merchantDir = path.join(this.uploadDir, merchantId);
      if (!fs.existsSync(merchantDir)) {
        fs.mkdirSync(merchantDir, { recursive: true });
      }

      // Get file extension
      const ext = path.extname(logoFile.originalname) || '.png';
      const filename = `logo${ext}`;
      const filePath = path.join(merchantDir, filename);

      // Delete old logo if exists
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const oldBranding = await (
        this.prisma as any
      ).merchantBranding.findUnique({
        where: { merchantId },
      });
      if (oldBranding?.logoUrl) {
        const oldPath = path.join(process.cwd(), 'public', oldBranding.logoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Save new logo
      fs.writeFileSync(
        filePath,
        logoFile.buffer || fs.readFileSync(logoFile.path),
      );

      // Clean up temp file if it exists
      if (logoFile.path && fs.existsSync(logoFile.path)) {
        fs.unlinkSync(logoFile.path);
      }

      logoUrl = `/uploads/branding/${merchantId}/${filename}`;
    }

    // Prepare update data
    const updateData: {
      primaryColor?: string;
      secondaryColor?: string;
      displayName?: string | null;
      tagline?: string | null;
      showPoweredBy?: boolean;
      logoUrl?: string;
    } = {};

    if (updateDto.primaryColor !== undefined) {
      updateData.primaryColor = updateDto.primaryColor;
    }
    if (updateDto.secondaryColor !== undefined) {
      updateData.secondaryColor = updateDto.secondaryColor;
    }
    if (updateDto.displayName !== undefined) {
      updateData.displayName = updateDto.displayName || null;
    }
    if (updateDto.tagline !== undefined) {
      // Allow empty string to clear tagline
      updateData.tagline = updateDto.tagline.trim() || null;
    }
    if (updateDto.showPoweredBy !== undefined) {
      // Ensure boolean conversion (handle string "true"/"false" from form data)
      const showPoweredByValue = updateDto.showPoweredBy;
      if (typeof showPoweredByValue === 'string') {
        updateData.showPoweredBy =
          showPoweredByValue === 'true' || showPoweredByValue === '1';
      } else {
        updateData.showPoweredBy = Boolean(showPoweredByValue);
      }
    }
    if (logoUrl) {
      updateData.logoUrl = logoUrl;
    }

    // Prepare create data with defaults
    const createData = {
      merchantId,
      primaryColor: updateData.primaryColor || '#5CFFCE',
      secondaryColor: updateData.secondaryColor || '#4F46E5',
      displayName: updateData.displayName ?? null,
      tagline: updateData.tagline ?? null,
      showPoweredBy:
        updateData.showPoweredBy !== undefined
          ? Boolean(updateData.showPoweredBy)
          : true,
      logoUrl: updateData.logoUrl ?? null,
    };

    // Prepare update data (only include fields that were provided)
    const updateDataClean: {
      primaryColor?: string;
      secondaryColor?: string;
      displayName?: string | null;
      tagline?: string | null;
      showPoweredBy?: boolean;
      logoUrl?: string;
    } = {};

    if (updateData.primaryColor !== undefined) {
      updateDataClean.primaryColor = updateData.primaryColor;
    }
    if (updateData.secondaryColor !== undefined) {
      updateDataClean.secondaryColor = updateData.secondaryColor;
    }
    if (updateData.displayName !== undefined) {
      updateDataClean.displayName = updateData.displayName;
    }
    if (updateData.tagline !== undefined) {
      updateDataClean.tagline = updateData.tagline;
    }
    if (updateData.showPoweredBy !== undefined) {
      updateDataClean.showPoweredBy = Boolean(updateData.showPoweredBy);
    }
    if (updateData.logoUrl !== undefined) {
      updateDataClean.logoUrl = updateData.logoUrl;
    }

    // Upsert branding
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const branding = await (this.prisma as any).merchantBranding.upsert({
      where: { merchantId },
      create: createData,
      update: updateDataClean,
    });

    return branding;
  }

  async deleteLogo(merchantId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const branding = await (this.prisma as any).merchantBranding.findUnique({
      where: { merchantId },
    });

    if (!branding?.logoUrl) {
      return;
    }

    // Delete file
    const filePath = path.join(process.cwd(), 'public', branding.logoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update database
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await (this.prisma as any).merchantBranding.update({
      where: { merchantId },
      data: { logoUrl: null },
    });
  }

  async deleteBranding(merchantId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const branding = await (this.prisma as any).merchantBranding.findUnique({
      where: { merchantId },
    });

    if (!branding) {
      return;
    }

    // Delete logo file if exists
    if (branding.logoUrl) {
      const filePath = path.join(process.cwd(), 'public', branding.logoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete branding record
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await (this.prisma as any).merchantBranding.delete({
      where: { merchantId },
    });
  }
}
