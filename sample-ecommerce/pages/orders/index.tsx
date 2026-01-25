import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { Order } from '../../lib/types';
import { formatCurrency } from '../../lib/fetanpay';
import { Package, Eye, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll just show a message about viewing orders
    // In a real app, you'd fetch orders for the logged-in user
    setLoading(false);
  }, []);

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

  if (loading) {
    return (
      <Layout title="Your Orders">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Your Orders">
      <div className="max-w-4xl mx-auto">
        {/* Demo Notice */}
        <div className="card p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            📋 Order History Demo
          </h2>
          <div className="space-y-3 text-blue-800">
            <p>
              In a real application, this page would show orders for the logged-in user.
              For this demo, you can:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Create a new order by shopping and checking out</li>
              <li>View order details using the direct order URL</li>
              <li>Test the payment verification process</li>
            </ul>
            <p className="text-sm">
              <strong>Note:</strong> This demo doesn't include user authentication, 
              so orders are stored locally and can be accessed via direct URLs.
            </p>
          </div>
        </div>

        {/* Sample Order for Demo */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Sample Order (Demo)</h3>
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">Order #SAMPLE_123</h4>
                <p className="text-sm text-gray-600">
                  Placed on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="badge badge-info">DEMO</span>
                <Link 
                  href="/orders/SAMPLE_ORDER_123"
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Customer</p>
                <p className="font-medium">Test Customer</p>
              </div>
              <div>
                <p className="text-gray-600">Total</p>
                <p className="font-medium">{formatCurrency(900.00)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className="badge badge-warning">PENDING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Orders Yet
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your order history here.
          </p>
          <Link href="/" className="btn btn-primary inline-flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Start Shopping</span>
          </Link>
        </div>

        {/* Integration Info */}
        <div className="card p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">🔧 Integration Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Order Management</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✅ Order creation and tracking</li>
                <li>✅ Real-time status updates</li>
                <li>✅ Payment reference generation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">FetanPay Integration</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✅ API-based payment verification</li>
                <li>✅ Webhook event handling</li>
                <li>✅ Secure signature verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}