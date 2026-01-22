import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendSmsOptions {
  to: string;
  message: string;
  from?: string;
  sender?: string;
  callback?: string;
  template?: number;
}

export interface BulkSmsOptions {
  to: string[] | Array<{ to: string; message: string }>;
  message?: string;
  from?: string;
  sender?: string;
  campaign?: string;
  createCallback?: string;
  statusCallback?: string;
}

export interface SmsResponse {
  acknowledge: 'success' | 'failure';
  response: {
    status?: string;
    message_id?: string;
    message?: string;
    to?: string;
    campaign_id?: string;
    error?: string;
  };
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl = 'https://api.afromessage.com/api';
  private readonly token: string | undefined;
  private readonly defaultSender: string;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('AFROMESSAGE_TOKEN')?.trim();
    this.defaultSender = this.configService.get<string>('AFROMESSAGE_SENDER', 'FetanPay');
    this.defaultFrom = this.configService.get<string>('AFROMESSAGE_FROM', '');

    if (!this.token) {
      this.logger.warn('AfroMessage token not configured. SMS functionality will be disabled.');
    } else {
      this.logger.log(`SMS service initialized with token length: ${this.token.length}`);
    }
  }

  /**
   * Send a single SMS message
   */
  async sendSms(options: SendSmsOptions): Promise<SmsResponse> {
    if (!this.token) {
      throw new BadRequestException('SMS service not configured');
    }

    if (!options.to || !options.message) {
      throw new BadRequestException('Recipient phone number and message are required');
    }

    // Validate phone number format (basic validation)
    if (!this.isValidPhoneNumber(options.to)) {
      throw new BadRequestException('Invalid phone number format');
    }

    const payload = {
      from: options.from || this.defaultFrom || undefined,
      sender: options.sender || this.defaultSender || undefined,
      to: options.to,
      message: options.message,
      callback: options.callback,
      template: options.template || 0,
    };

    // Remove empty values - let AfroMessage use defaults
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    try {
      this.logger.log(`Sending SMS to ${options.to}`);
      this.logger.debug(`SMS payload:`, payload);
      
      const response = await fetch(`${this.apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`SMS API request failed with status ${response.status}: ${errorText}`);
        throw new BadRequestException(`SMS API error (${response.status}): ${errorText}`);
      }

      const result: SmsResponse = await response.json();

      if (result.acknowledge === 'success') {
        this.logger.log(`SMS sent successfully to ${options.to}. Message ID: ${result.response.message_id}`);
      } else {
        this.logger.error(`Failed to send SMS to ${options.to}:`, result.response.error || result.response);
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error sending SMS to ${options.to}:`, error);
      
      // Provide more specific error messages
      if (error.message?.includes('fetch')) {
        throw new BadRequestException('Failed to connect to SMS service. Please check your internet connection.');
      }
      
      throw new BadRequestException(`Failed to send SMS: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSms(options: BulkSmsOptions): Promise<SmsResponse> {
    if (!this.token) {
      throw new BadRequestException('SMS service not configured');
    }

    if (!options.to || !Array.isArray(options.to) || options.to.length === 0) {
      throw new BadRequestException('Recipients list is required and must be a non-empty array');
    }

    // Validate phone numbers
    const phoneNumbers = Array.isArray(options.to[0]) 
      ? (options.to as Array<{ to: string; message: string }>).map(item => item.to)
      : options.to as string[];

    for (const phone of phoneNumbers) {
      if (!this.isValidPhoneNumber(phone)) {
        throw new BadRequestException(`Invalid phone number format: ${phone}`);
      }
    }

    const payload = {
      from: options.from || this.defaultFrom,
      sender: options.sender || this.defaultSender,
      to: options.to,
      message: options.message,
      campaign: options.campaign || `Bulk SMS ${new Date().toISOString()}`,
      createCallback: options.createCallback,
      statusCallback: options.statusCallback,
    };

    // Remove empty values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    try {
      this.logger.log(`Sending bulk SMS to ${phoneNumbers.length} recipients`);
      
      const response = await fetch(`${this.apiUrl}/bulk_send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: SmsResponse = await response.json();

      if (result.acknowledge === 'success') {
        this.logger.log(`Bulk SMS scheduled successfully. Campaign ID: ${result.response.campaign_id}`);
      } else {
        this.logger.error(`Failed to send bulk SMS:`, result.response.error);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error sending bulk SMS:`, error);
      throw new BadRequestException(`Failed to send bulk SMS: ${error.message}`);
    }
  }

  /**
   * Validate phone number format
   * Accepts Ethiopian phone numbers in various formats
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Ethiopian phone number patterns:
    // +251XXXXXXXXX (13 digits total)
    // 251XXXXXXXXX (12 digits total)
    // 09XXXXXXXX (10 digits starting with 09)
    // 07XXXXXXXX (10 digits starting with 07)
    
    if (cleaned.length === 13 && cleaned.startsWith('251')) {
      return true;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('251')) {
      return true;
    }
    
    if (cleaned.length === 10 && (cleaned.startsWith('09') || cleaned.startsWith('07'))) {
      return true;
    }
    
    return false;
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 09 or 07, convert to +251
    if (cleaned.length === 10 && (cleaned.startsWith('09') || cleaned.startsWith('07'))) {
      return `+251${cleaned.substring(1)}`;
    }
    
    // If it starts with 251, add +
    if (cleaned.length === 12 && cleaned.startsWith('251')) {
      return `+${cleaned}`;
    }
    
    // If it already has +251
    if (cleaned.length === 13 && cleaned.startsWith('251')) {
      return `+${cleaned}`;
    }
    
    // If it starts with + already
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Return as is if we can't determine the format
    return phone;
  }

  /**
   * Check if SMS service is configured
   */
  isConfigured(): boolean {
    return !!this.token;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      defaultSender: this.defaultSender,
      defaultFrom: this.defaultFrom,
      apiUrl: this.apiUrl,
      tokenConfigured: !!this.token,
      tokenLength: this.token?.length || 0,
    };
  }

  /**
   * Test SMS service configuration without sending actual SMS
   */
  async validateConfiguration(): Promise<any> {
    const status = this.getStatus();
    
    if (!status.configured) {
      return {
        valid: false,
        error: 'SMS service not configured - missing AFROMESSAGE_TOKEN',
        status,
      };
    }

    // Test API connectivity without sending SMS
    try {
      const response = await fetch(`${this.apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Invalid payload to test auth without sending
          to: '',
          message: '',
        }),
      });

      const responseText = await response.text();
      
      return {
        valid: true,
        status,
        apiResponse: {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        },
        message: 'SMS service configuration is valid',
      };
    } catch (error) {
      return {
        valid: false,
        error: `Failed to connect to SMS API: ${error.message}`,
        status,
      };
    }
  }
}