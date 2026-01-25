import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import PaymentVerificationModal from '../../components/PaymentVerificationModal';
import { Order, PaymentResponse } from '../../lib/types';
import { formatCurrency, getPaymentInstructions } from '../../lib/fetanpay';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Copy
} from 'lucide-react';

export default function OrderPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [transactionReference, setTransactionReference] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    success: boolean;
    title: string;
    message: string;
    details: PaymentResponse | null;
  } | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchOrder(id);
    }
  }, [id]);

  useEffect(() => {
    if (order && order.paymentReference && order.paymentProvider) {
      const instructions = getPaymentInstructions(
        order.paymentProvider,
        order.paymentReference,
        order.total
      );
      setPaymentInstructions(instructions);
    }
  }, [order]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!order || !transactionReference.trim()) {
      setModalData({
        success: false,
        title: 'Missing Information',
        message: 'Please enter your transaction reference',
        details: null
      });
      setShowModal(true);
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          reference: transactionReference.trim(),
          amount: order.total,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const paymentResult: PaymentResponse = result.data;
        
        if (paymentResult.status === 'VERIFIED') {
          // Refresh order data
          await fetchOrder(order.id);
          setModalData({
            success: true,
            title: 'Payment Verified Successfully! ✅',
            message: 'Your payment has been confirmed and your order is now being processed.',
            details: paymentResult
          });
          setTransactionReference(''); // Clear the input
        } else {
          setModalData({
            success: false,
            title: 'Payment Not Verified ❌',
            message: 'We could not verify your payment. Please check the details below:',
            details: paymentResult
          });
        }
      } else {
        setModalData({
          success: false,
          title: 'Verification Failed ❌',
          message: result.error || 'An error occurred during verification',
          details: null
        });
      }
      
      setShowModal(true);
    } catch (err) {
      setModalData({
        success: false,
        title: 'Connection Error ❌',
        message: 'Failed to connect to verification service. Please try again.',
        details: null
      });
      setShowModal(true);
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'PROCESSING':
      case 'SHIPPED':
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'PAYMENT_PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5" />;
      case 'PROCESSING':
      case 'SHIPPED':
        return <Package className="h-5 w-5" />;
      case 'PAYMENT_PENDING':
        return <Clock className="h-5 w-5" />;
      case 'CANCELLED':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Layout title="Loading Order...">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout title="Order Not Found">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || 'The order you are looking for does not exist.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Back to Shop
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Order #${order.id.slice(-8)}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Order Header */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.id.slice(-8)}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="font-medium">{order.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p className="text-gray-600">{order.customerName}</p>
              <p className="text-gray-600">{order.customerEmail}</p>
            </div>
            
            {order.shippingAddress && (
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-gray-600">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.zipCode} {order.shippingAddress.country}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Status & Instructions */}
        {order.status === 'PAYMENT_PENDING' && paymentInstructions && (
          <div className="card p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-800">
                💳 Payment Required
              </h3>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-yellow-800 mb-3">
                {paymentInstructions.title}
              </h4>
              
              {/* Account Details Box */}
              {paymentInstructions.receiverAccount && (
                <div className="bg-white p-4 rounded-lg border-2 border-yellow-300 mb-3">
                  <h5 className="font-semibold text-gray-800 mb-2">💳 Transfer Details:</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-mono text-lg font-bold text-blue-600">
                        {paymentInstructions.receiverAccount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-semibold text-gray-800">
                        {paymentInstructions.receiverName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {paymentInstructions.instructions.map((instruction: string, index: number) => (
                  <p key={index} className="text-sm text-yellow-700">
                    {instruction}
                  </p>
                ))}
              </div>
            </div>

            {/* Transaction Reference Input */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Transaction Reference
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TXN123456789, REF-2024-001, etc."
                />
                <button
                  onClick={verifyPayment}
                  disabled={verifying || !transactionReference.trim()}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Verify Payment</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 This is the transaction reference you received from your bank after completing the transfer
              </p>
            </div>

            {/* Order Reference (for merchant records) */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Order Reference (for merchant records)</p>
                  <p className="font-mono text-lg font-semibold text-blue-800">{order.paymentReference}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(order.paymentReference!)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">☕</span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">{item.product.category}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.product.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Integration Demo Info */}
        <div className="card p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🚀 FetanPay Integration Demo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">API Integration</h4>
              <ul className="space-y-1 text-blue-700">
                <li>✅ Order creation via API</li>
                <li>✅ Payment verification calls</li>
                <li>✅ Real-time status updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Webhook Events</h4>
              <ul className="space-y-1 text-blue-700">
                <li>✅ payment.verified events</li>
                <li>✅ Automatic order updates</li>
                <li>✅ Secure signature verification</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/')}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Package className="h-5 w-5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Verification Result Modal */}
        <PaymentVerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          result={modalData}
        />
      </div>
    </Layout>
  );
}