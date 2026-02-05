import { useState } from 'react';
import { Product } from '../lib/types';
import { useCart } from '../pages/_app';
import { formatCurrency } from '../lib/fetanpay';
import { Plus, Check, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!product.inStock) return;

    setIsAdding(true);
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addToCart({
      product,
      quantity: 1
    });

    setIsAdding(false);
    setJustAdded(true);

    // Reset the "just added" state after 2 seconds
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
        <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">☕</div>
            <div className="text-xs text-gray-600">{product.name}</div>
          </div>
        </div>
        
        {/* Stock status badge */}
        {!product.inStock && (
          <div className="absolute top-2 right-2">
            <span className="badge badge-error">
              <AlertCircle className="h-3 w-3 mr-1" />
              Out of Stock
            </span>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="badge badge-info">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-amber-600">
            {formatCurrency(product.price)}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding || justAdded}
            className={`
              btn flex items-center space-x-2 min-w-[100px] justify-center
              ${!product.inStock 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : justAdded
                ? 'btn-success'
                : 'btn-primary'
              }
            `}
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Adding...</span>
              </>
            ) : justAdded ? (
              <>
                <Check className="h-4 w-4" />
                <span>Added!</span>
              </>
            ) : !product.inStock ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Unavailable</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}