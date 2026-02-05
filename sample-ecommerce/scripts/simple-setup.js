const fs = require('fs');
const path = require('path');

console.log('🗄️ Setting up simple file-based storage...');

const dbDir = path.join(__dirname, '..');
const dbFile = path.join(dbDir, 'simple-db.json');

// Create a simple JSON database for demo purposes
const initialData = {
  orders: {
    'SAMPLE_ORDER_123': {
      id: 'SAMPLE_ORDER_123',
      customerEmail: 'test@example.com',
      customerName: 'Test Customer',
      items: [
        {
          product: {
            id: 'ethiopian-yirgacheffe',
            name: 'Ethiopian Yirgacheffe',
            price: 450.00,
            category: 'Single Origin'
          },
          quantity: 2
        }
      ],
      total: 900.00,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  paymentLogs: []
};

try {
  fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
  console.log('✅ Simple database created successfully');
  console.log('✅ Sample order added');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Copy .env.local.example to .env.local');
  console.log('2. Add your FetanPay API key and webhook secret');
  console.log('3. Run: npm run dev');
  console.log('4. Visit: http://localhost:3001');
  console.log('');
  console.log('ℹ️  Note: This uses a simple JSON file instead of SQLite for easier setup');
} catch (error) {
  console.error('❌ Setup error:', error.message);
  process.exit(1);
}