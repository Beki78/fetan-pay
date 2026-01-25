// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Order Types
export type OrderStatus = 'PENDING' | 'PAYMENT_PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentReference?: string;
  paymentProvider?: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Payment Types
export interface PaymentRequest {
  orderId: string;
  provider: 'CBE' | 'BOA' | 'AWASH' | 'DASHEN' | 'TELEBIRR';
  reference: string;
  amount: number;
}

export interface PaymentResponse {
  status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  payment?: {
    id: string;
    reference: string;
    amount?: number | string; // Can be number or string from API
    claimedAmount?: number | string; // FetanPay API returns this as string
    provider: string;
    verifiedAt: string;
    sender?: string;
  };
  checks?: {
    referenceFound: boolean;
    receiverMatches: boolean;
    amountMatches: boolean;
  };
  transaction?: {
    reference: string;
    receiverAccount: string;
    receiverName: string;
    amount: number;
    senderName: string;
    raw: any;
  };
}

// Webhook Types
export interface WebhookEvent {
  id: string;
  type: 'payment.verified' | 'payment.unverified' | 'payment.duplicate' | 'wallet.charged' | 'wallet.insufficient' | 'test';
  created: number;
  data: {
    payment?: {
      id: string;
      reference: string;
      provider: string;
      amount: number;
      status: string;
      verifiedAt?: string;
      mismatchReason?: string;
    };
    merchant?: {
      id: string;
      name: string;
    };
    wallet?: {
      balanceBefore: number;
      balanceAfter: number;
      chargedAmount: number;
    };
    message?: string;
    timestamp?: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Database Types
export interface DatabaseOrder {
  id: string;
  customer_email: string;
  customer_name: string;
  items_json: string;
  total: number;
  status: OrderStatus;
  payment_reference?: string;
  payment_provider?: string;
  created_at: string;
  updated_at: string;
  shipping_address_json?: string;
}