import crypto from 'crypto';
import { PaymentRequest, PaymentResponse, WebhookEvent } from './types';

// These will only be available on the server side
const getServerConfig = () => {
  if (typeof window === 'undefined') {
    // Server side only
    return {
      FETANPAY_API_URL: process.env.FETANPAY_API_URL || 'http://localhost:3003/api/v1',
      FETANPAY_API_KEY: process.env.FETANPAY_API_KEY,
      FETANPAY_WEBHOOK_SECRET: process.env.FETANPAY_WEBHOOK_SECRET,
    };
  }
  return {
    FETANPAY_API_URL: 'http://localhost:3003/api/v1',
    FETANPAY_API_KEY: undefined,
    FETANPAY_WEBHOOK_SECRET: undefined,
  };
};

export class FetanPayClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    const config = getServerConfig();
    this.apiKey = apiKey || config.FETANPAY_API_KEY || '';
    this.baseUrl = baseUrl || config.FETANPAY_API_URL;
  }

  /**
   * Verify a payment with FetanPay
   */
  async verifyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          provider: request.provider,
          reference: request.reference,
          claimedAmount: request.amount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FetanPay API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as PaymentResponse;
    } catch (error) {
      console.error('FetanPay verification error:', error);
      throw error;
    }
  }

  /**
   * Get active receiver accounts for a provider
   */
  async getActiveReceiverAccounts(provider?: string): Promise<any> {
    try {
      const url = provider 
        ? `${this.baseUrl}/payments/receiver-accounts/active?provider=${provider}`
        : `${this.baseUrl}/payments/receiver-accounts/active`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FetanPay API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('FetanPay receiver accounts error:', error);
      throw error;
    }
  }

  /**
   * Get verification history
   */
  async getVerificationHistory(page = 1, pageSize = 10): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/verification-history?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FetanPay API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('FetanPay verification history error:', error);
      throw error;
    }
  }
}

/**
 * Verify webhook signature to ensure authenticity
 * This should only be called on the server side
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret?: string
): boolean {
  try {
    const config = getServerConfig();
    const webhookSecret = secret || config.FETANPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(orderId: string): string {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
  return `COFFEE_${orderId.slice(-4)}_${timestamp}_${random}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get payment instructions for a provider
 */
export function getPaymentInstructions(provider: string, reference: string, amount: number): {
  title: string;
  instructions: string[];
  accountInfo?: string;
  receiverAccount?: string;
  receiverName?: string;
} {
  const formattedAmount = formatCurrency(amount);
  
  const instructions = {
    CBE: {
      title: 'Commercial Bank of Ethiopia (CBE)',
      instructions: [
        '1. Open your CBE mobile app or visit any CBE branch',
        '2. Select "Transfer Money" or "Send Money"',
        `3. Transfer ${formattedAmount} to account: 1000155415774`,
        '4. Receiver Name: Ephrem Belaineh',
        '5. Complete the transfer and save your transaction reference',
        '6. Enter your transaction reference below to verify payment'
      ],
      accountInfo: 'Transfer to the account details shown above',
      receiverAccount: '1000155415774',
      receiverName: 'Ephrem Belaineh'
    },
    BOA: {
      title: 'Bank of Abyssinia (BOA)',
      instructions: [
        '1. Open your BOA mobile app or visit any BOA branch',
        '2. Select "Money Transfer"',
        `3. Transfer ${formattedAmount} to the merchant account`,
        '4. Complete the transfer and save your transaction reference',
        '5. Enter your transaction reference below to verify payment'
      ],
      accountInfo: 'Account details will be provided after order confirmation'
    },
    AWASH: {
      title: 'Awash Bank',
      instructions: [
        '1. Open your Awash mobile app or visit any Awash branch',
        '2. Select "Transfer"',
        `3. Transfer ${formattedAmount} to the merchant account`,
        '4. Complete the transfer and save your transaction reference',
        '5. Enter your transaction reference below to verify payment'
      ],
      accountInfo: 'Account details will be provided after order confirmation'
    },
    DASHEN: {
      title: 'Dashen Bank',
      instructions: [
        '1. Open your Dashen mobile app or visit any Dashen branch',
        '2. Select "Transfer Money"',
        `3. Transfer ${formattedAmount} to the merchant account`,
        '4. Complete the transfer and save your transaction reference',
        '5. Enter your transaction reference below to verify payment'
      ],
      accountInfo: 'Account details will be provided after order confirmation'
    },
    TELEBIRR: {
      title: 'TeleBirr',
      instructions: [
        '1. Open your TeleBirr app',
        '2. Select "Send Money"',
        `3. Transfer ${formattedAmount} to the merchant phone number`,
        '4. Complete the transfer and save your transaction reference',
        '5. Enter your transaction reference below to verify payment'
      ],
      accountInfo: 'Phone number will be provided after order confirmation'
    }
  };

  return instructions[provider as keyof typeof instructions] || {
    title: 'Bank Transfer',
    instructions: [
      `1. Transfer ${formattedAmount} to the provided account`,
      '2. Save your transaction reference',
      '3. Enter the reference below to verify payment'
    ]
  };
}

// Create server-side client factory
export function createFetanPayClient(): FetanPayClient {
  if (typeof window !== 'undefined') {
    throw new Error('FetanPayClient should only be instantiated on the server side');
  }
  return new FetanPayClient();
}