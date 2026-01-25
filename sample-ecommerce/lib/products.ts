import { Product } from './types';

// Sample coffee products for the demo
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'test-coffee-111',
    name: 'Test Coffee - 111 ETB',
    description: 'Special test coffee for payment verification demo. Perfect for testing the FetanPay integration with a simple 111 ETB price.',
    price: 111.00,
    image: '/images/coffee-test.jpg',
    category: 'Test Product',
    inStock: true
  },
  {
    id: 'ethiopian-yirgacheffe',
    name: 'Ethiopian Yirgacheffe',
    description: 'A bright, floral coffee with notes of lemon and tea. Grown in the highlands of Yirgacheffe, this coffee is known for its clean, wine-like acidity.',
    price: 111.00,
    image: '/images/coffee-1.jpg',
    category: 'Single Origin',
    inStock: true
  },
  {
    id: 'sidamo-organic',
    name: 'Sidamo Organic',
    description: 'Full-bodied coffee with chocolate and spice notes. Organically grown in the Sidamo region, this coffee offers a rich, complex flavor profile.',
    price: 520.00,
    image: '/images/coffee-2.jpg',
    category: 'Organic',
    inStock: true
  },
  {
    id: 'harar-longberry',
    name: 'Harar Longberry',
    description: 'Wine-like coffee with fruity undertones. This ancient variety from Harar province is dry-processed to enhance its natural fruit flavors.',
    price: 480.00,
    image: '/images/coffee-3.jpg',
    category: 'Single Origin',
    inStock: true
  },
  {
    id: 'limu-washed',
    name: 'Limu Washed',
    description: 'Balanced coffee with citrus and floral notes. Wet-processed in the Limu region, this coffee offers a clean, bright cup with excellent clarity.',
    price: 420.00,
    image: '/images/coffee-4.jpg',
    category: 'Washed',
    inStock: true
  },
  {
    id: 'jimma-natural',
    name: 'Jimma Natural',
    description: 'Sweet, fruity coffee with berry notes. Natural processing in Jimma creates a coffee with intense fruit flavors and syrupy body.',
    price: 390.00,
    image: '/images/coffee-5.jpg',
    category: 'Natural Process',
    inStock: true
  },
  {
    id: 'kaffa-forest',
    name: 'Kaffa Forest Coffee',
    description: 'Wild coffee from the birthplace of coffee. Harvested from wild coffee trees in Kaffa forests, this coffee offers unique, complex flavors.',
    price: 650.00,
    image: '/images/coffee-6.jpg',
    category: 'Wild Forest',
    inStock: true
  },
  {
    id: 'espresso-blend',
    name: 'House Espresso Blend',
    description: 'Perfect balance for espresso. A carefully crafted blend of Ethiopian beans designed for espresso, with rich crema and balanced flavor.',
    price: 380.00,
    image: '/images/coffee-7.jpg',
    category: 'Blend',
    inStock: true
  },
  {
    id: 'decaf-sidamo',
    name: 'Decaf Sidamo',
    description: 'All the flavor, none of the caffeine. Swiss water processed decaffeinated Sidamo coffee that retains the original flavor profile.',
    price: 460.00,
    image: '/images/coffee-8.jpg',
    category: 'Decaf',
    inStock: true
  },
  {
    id: 'cold-brew-blend',
    name: 'Cold Brew Blend',
    description: 'Specially crafted for cold brewing. A blend designed to extract smoothly in cold water, producing a refreshing, low-acid coffee.',
    price: 350.00,
    image: '/images/coffee-9.jpg',
    category: 'Cold Brew',
    inStock: true
  },
  {
    id: 'premium-geisha',
    name: 'Premium Geisha',
    description: 'Rare and exquisite variety. Limited edition Geisha variety with exceptional floral and tea-like characteristics. A true coffee connoisseur\'s choice.',
    price: 1200.00,
    image: '/images/coffee-10.jpg',
    category: 'Premium',
    inStock: false // Out of stock for demo
  }
];

export function getAllProducts(): Product[] {
  return SAMPLE_PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return SAMPLE_PRODUCTS.find(product => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return SAMPLE_PRODUCTS.filter(product => product.category === category);
}

export function getAvailableProducts(): Product[] {
  return SAMPLE_PRODUCTS.filter(product => product.inStock);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return SAMPLE_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
}

export function getCategories(): string[] {
  const categories = SAMPLE_PRODUCTS.map(product => product.category);
  return [...new Set(categories)].sort();
}