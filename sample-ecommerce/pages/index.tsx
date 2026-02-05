import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { Product } from '../lib/types';
import { getAllProducts, getCategories, searchProducts, getProductsByCategory } from '../lib/products';
import { Search, Filter } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const allProducts = getAllProducts();
    const allCategories = getCategories();
    
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setCategories(allCategories);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchProducts(searchQuery);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="coffee-bg rounded-lg p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ☕ Welcome to FetanPay Coffee Shop
        </h1>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          Discover the finest Ethiopian coffee beans, now with seamless FetanPay integration. 
          Experience secure, real-time payment verification for your coffee orders.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2 bg-white/50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Real-time Payment Verification</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Webhook Integration</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Secure API Authentication</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search coffee products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Our Coffee Collection
          </h2>
          <span className="text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Integration Info Section */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-xl font-semibold mb-4">🚀 FetanPay Integration Demo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🛒</div>
            <h4 className="font-semibold text-blue-900">Add to Cart</h4>
            <p className="text-sm text-blue-700">Browse and select products</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">💳</div>
            <h4 className="font-semibold text-green-900">Checkout</h4>
            <p className="text-sm text-green-700">Get payment instructions</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-semibold text-purple-900">API Verification</h4>
            <p className="text-sm text-purple-700">Real-time payment check</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-2">🔔</div>
            <h4 className="font-semibold text-orange-900">Webhook Update</h4>
            <p className="text-sm text-orange-700">Instant order completion</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}