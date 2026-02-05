import { ReactNode } from 'react';
import Link from 'next/link';
import { useCart } from '../pages/_app';
import { ShoppingCart, Coffee, Home, Package } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'FetanPay Coffee Shop' }: LayoutProps) {
  const { cart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold text-gray-900">
                FetanPay Coffee Shop
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link 
                href="/orders" 
                className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Orders</span>
              </Link>
            </nav>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {cart.itemCount > 0 && (
                <span className="bg-amber-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Page Title */}
      {title !== 'FetanPay Coffee Shop' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coffee className="h-6 w-6 text-amber-600" />
                <span className="text-lg font-semibold">FetanPay Coffee Shop</span>
              </div>
              <p className="text-gray-600 text-sm">
                A sample e-commerce application demonstrating FetanPay integration.
                Built with Next.js and TypeScript.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
                <li><Link href="/cart" className="hover:text-amber-600">Cart</Link></li>
                <li><Link href="/orders" className="hover:text-amber-600">Orders</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Integration Demo</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ FetanPay API Integration</li>
                <li>✅ Real-time Payment Verification</li>
                <li>✅ Webhook Event Handling</li>
                <li>✅ Secure Payment Processing</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 FetanPay Coffee Shop Demo. Built for developer education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}