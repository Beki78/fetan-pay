import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useCart } from './_app';
import { formatCurrency, generatePaymentReference, getPaymentInstructions } from '../lib/fetanpay';
import { ApiResponse } from '../lib/types';
import { CreditCard, User, MapPin, ArrowLeft, Loader2 } from 'lucide-react';

interface CheckoutForm {
  customerName: string;
  paymentProvider: 'CBE' | 'BOA' | 'AWASH' | 'DASHEN' | 'TELEBIRR';
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false); // Add this flag
  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: '',
    paymentProvider: 'CBE'
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if cart is empty (only on client side and not after order completion)
  useEffect(() => {
    if (isClient && cart.items.length === 0 && !orderCompleted) {
      router.push('/cart');
    }
  }, [isClient, cart.items.length, router, orderCompleted]);

  // Show loading or nothing during SSR
  if (!isClient) {
    return (
      <Layout title="Checkout">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Return null if cart is empty (will redirect)
  if (cart.items.length === 0) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted!', { formData, isFormValid: isFormValid() });
    setIsProcessing(true);

    try {
      console.log('📤 Sending order request...');
      // Create order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: `${formData.customerName.toLowerCase().replace(/\s+/g, '')}@demo.com`, // Generate demo email
          items: cart.items,
          total: cart.total,
          paymentProvider: formData.paymentProvider,
          shippingAddress: {
            street: 'Demo Address',
            city: 'Addis Ababa',
            state: 'Addis Ababa',
            zipCode: '1000',
            country: 'Ethiopia'
          }
        }),
      });

      console.log('📥 Order response:', orderResponse.status);
      const orderResult: ApiResponse = await orderResponse.json();
      console.log('📋 Order result:', orderResult);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      console.log('✅ Order created successfully, redirecting...');
      console.log('🔗 Redirect URL:', `/orders/${orderResult.data.id}`);
      
      // Set order completed flag to prevent cart empty redirect
      setOrderCompleted(true);
      
      // Clear cart and redirect to order page
      clearCart();
      console.log('🛒 Cart cleared');
      
      const redirectUrl = `/orders/${orderResult.data.id}`;
      console.log('🚀 Attempting redirect to:', redirectUrl);
      
      await router.push(redirectUrl);
      console.log('✅ Redirect completed');

    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return formData.customerName.trim();
  };

  return (
    <Layout title="Checkout">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Customer Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Payment Method</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { value: 'CBE', label: 'Commercial Bank of Ethiopia (CBE)' },
                  { value: 'BOA', label: 'Bank of Abyssinia (BOA)' },
                  { value: 'AWASH', label: 'Awash Bank' },
                  { value: 'DASHEN', label: 'Dashen Bank' },
                  { value: 'TELEBIRR', label: 'TeleBirr' }
                ].map((provider) => (
                  <label key={provider.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value={provider.value}
                      checked={formData.paymentProvider === provider.value}
                      onChange={(e) => handleInputChange('paymentProvider', e.target.value)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-gray-900">{provider.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded flex items-center justify-center">
                        <span className="text-lg">☕</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-amber-600">{formatCurrency(cart.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Debug Info */}
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                  <p>Form Valid: {isFormValid() ? '✅ Yes' : '❌ No'}</p>
                  <p>Name: {formData.customerName ? '✅' : '❌'}</p>
                  <p>Payment Method: {formData.paymentProvider}</p>
                  <p>Cart Items: {cart.items.length}</p>
                </div>
                
                <button
                  type="submit"
                  disabled={!isFormValid() || isProcessing}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/cart')}
                  className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Cart</span>
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  🔒 Your payment will be processed securely through FetanPay with real-time verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}