import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  private readonly encryptionKey: string;
  private readonly merchantAppUrl: string;
  private readonly tokenExpiryHours = 24 * 30; // 30 days

  constructor(private readonly configService: ConfigService) {
    // Use BETTER_AUTH_SECRET or a dedicated QR_SECRET for encryption
    this.encryptionKey =
      this.configService.get<string>('QR_CODE_SECRET') ||
      this.configService.get<string>('BETTER_AUTH_SECRET') ||
      'default-secret-change-in-production';

    // Get merchant app URL from env (where QR codes should be scanned)
    // This is the client app URL where QR codes are scanned
    this.merchantAppUrl =
      this.configService.get<string>('MERCHANT_APP_URL') ||
      this.configService.get<string>('CLIENT_APP_URL') ||
      (process.env.NODE_ENV === 'production'
        ? 'https://client.fetanpay.et'
        : 'http://localhost:3002');
  }

  /**
   * Encrypts user credentials and creates QR code data
   * QR code contains: encrypted token with userId, merchantId, email, timestamp, and allowed domain
   */
  async generateQRCodeData(
    userId: string,
    merchantId: string,
    email: string,
    qrCodeToken: string,
  ): Promise<string> {
    const payload = {
      userId,
      merchantId,
      email,
      token: qrCodeToken,
      timestamp: Date.now(),
      domain: this.extractDomain(this.merchantAppUrl), // Only allow scanning from merchant app domain
      expiresAt: Date.now() + this.tokenExpiryHours * 60 * 60 * 1000,
    };

    // Encrypt the payload
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      this.encryptionKey,
    ).toString();

    // Return encrypted string that will be encoded in QR code
    return encrypted;
  }

  /**
   * Decrypts QR code data and validates it
   * Returns user credentials if valid, throws error if invalid
   */
  decryptQRCodeData(
    encryptedData: string,
    requestOrigin: string,
  ): {
    userId: string;
    merchantId: string;
    email: string;
    token: string;
  } {
    try {
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        throw new Error('Invalid QR code: decryption failed');
      }

      const payload = JSON.parse(decryptedString);

      // Validate timestamp (check if expired)
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        throw new Error('QR code has expired. Please request a new one.');
      }

      // Validate domain - ensure request comes from merchant app
      const requestDomain = this.extractDomain(requestOrigin);
      if (payload.domain && payload.domain !== requestDomain) {
        throw new Error(
          'QR code can only be scanned from the authorized merchant application.',
        );
      }

      // Validate required fields
      if (
        !payload.userId ||
        !payload.merchantId ||
        !payload.email ||
        !payload.token
      ) {
        throw new Error('Invalid QR code: missing required data');
      }

      return {
        userId: payload.userId,
        merchantId: payload.merchantId,
        email: payload.email,
        token: payload.token,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid QR code: failed to decrypt');
    }
  }

  /**
   * Generates QR code image as data URL
   */
  async generateQRCodeImage(encryptedData: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(encryptedData, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 300,
      });
      return dataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code image');
    }
  }

  /**
   * Extracts domain from URL (e.g., http://localhost:3002 -> localhost:3002)
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.host; // Returns "localhost:3002" or "example.com"
    } catch {
      // If URL parsing fails, return as-is (might be just domain)
      return url;
    }
  }

  /**
   * Generates a unique token for QR code
   */
  generateQRToken(): string {
    // Generate a secure random token
    return CryptoJS.lib.WordArray.random(32).toString();
  }
}
