# ☕ FetanPay Coffee Shop - Sample E-commerce Integration

A complete Next.js e-commerce application demonstrating **FetanPay API and Webhook integration**.

## 🎯 **What This Demo Shows**

- ✅ **Product Catalog** - Browse coffee products
- ✅ **Shopping Cart** - Add/remove items
- ✅ **FetanPay Integration** - Real payment processing
- ✅ **API Usage** - Payment verification
- ✅ **Webhook Handling** - Real-time order updates
- ✅ **Order Tracking** - Complete order lifecycle
- ✅ **Security** - Proper API key and webhook secret usage

## 🚀 **Quick Start (Two Options)**

### **Option A: Simple Setup (Recommended for Demo)**
```bash
cd sample-ecommerce
npm install --legacy-peer-deps
cp .env.local.example .env.local
# Edit .env.local with your FetanPay credentials
npm run simple:setup
npm run dev
```

### **Option B: Full SQLite Setup**
```bash
cd sample-ecommerce
npm install --legacy-peer-deps
cp .env.local.example .env.local
# Edit .env.local with your FetanPay credentials
npm run db:setup
npm run dev
```

**Note:** If you encounter SQLite compilation issues, use Option A (Simple Setup).

### **Environment Configuration**
Edit `.env.local` and add your FetanPay credentials:
```bash
# FetanPay Configuration
FETANPAY_API_URL=http://localhost:3003/api/v1
FETANPAY_API_KEY=fetan_live_sk_YOUR_API_KEY_HERE
FETANPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
DATABASE_URL=./database.sqlite
```

Visit: **http://localhost:3001**

## 🔧 **FetanPay Setup Required**

### 1. **Get API Key**
1. Go to **Merchant Admin** → **Developer Tools** → **API Keys**
2. Create new API key
3. Copy to `.env.local` as `FETANPAY_API_KEY`

### 2. **Setup Webhook**
1. Go to **Merchant Admin** → **Developer Tools** → **Webhooks**
2. Create webhook with URL: `http://localhost:3001/api/webhooks/fetanpay`
3. Select events: `payment.verified`, `payment.unverified`
4. Copy secret to `.env.local` as `FETANPAY_WEBHOOK_SECRET`

## 📱 **How to Test**

### 1. **Browse Products**
- Visit the coffee shop
- Add items to cart
- Proceed to checkout

### 2. **Make Payment**
- Click "Pay with FetanPay"
- Follow payment instructions
- Make actual bank transfer (or use test data)

### 3. **Watch Real-time Updates**
- Order status updates automatically
- Webhook notifications in console
- Email confirmations (simulated)

## 🏗️ **Architecture**

```
Frontend (Next.js)
├── Product Catalog
├── Shopping Cart
├── Checkout Process
└── Order Tracking

Backend (API Routes)
├── /api/orders - Order management
├── /api/payments - FetanPay integration
├── /api/webhooks - Webhook handling
└── /api/products - Product data

FetanPay Integration
├── Payment Verification API
├── Webhook Notifications
└── Order Status Updates
```

## 📂 **Project Structure**

```
sample-ecommerce/
├── pages/
│   ├── index.tsx           # Home page (product catalog)
│   ├── cart.tsx            # Shopping cart
│   ├── checkout.tsx        # Checkout process
│   ├── orders/[id].tsx     # Order tracking
│   └── api/
│       ├── orders/         # Order management
│       ├── payments/       # FetanPay integration
│       ├── webhooks/       # Webhook handlers
│       └── products/       # Product data
├── components/
│   ├── ProductCard.tsx     # Product display
│   ├── Cart.tsx           # Cart component
│   ├── PaymentForm.tsx    # Payment interface
│   └── OrderStatus.tsx    # Order tracking
├── lib/
│   ├── fetanpay.ts        # FetanPay API client
│   ├── database.ts        # Database utilities
│   └── types.ts           # TypeScript types
└── styles/
    └── globals.css        # Tailwind CSS
```

## 🔍 **Key Integration Points**

### **API Usage Example:**
```typescript
// Verify payment with FetanPay
const response = await fetch('/api/payments/verify', {
  method: 'POST',
  body: JSON.stringify({
    orderId: order.id,
    reference: paymentReference,
    amount: order.total
  })
});
```

### **Webhook Handling:**
```typescript
// Handle FetanPay webhooks
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify webhook signature
  const isValid = verifyWebhookSignature(req.body, req.headers, webhookSecret);
  
  if (isValid && req.body.type === 'payment.verified') {
    // Update order status
    await updateOrderStatus(req.body.data.payment.reference, 'PAID');
  }
}
```

## 🎓 **Learning Objectives**

After running this demo, developers will understand:

1. **API Integration** - How to call FetanPay APIs
2. **Webhook Security** - Proper signature verification
3. **Real-time Updates** - Handling payment notifications
4. **Error Handling** - Managing failed payments
5. **User Experience** - Smooth payment flow
6. **Security** - Protecting API keys and secrets

## 🛡️ **Security Features**

- ✅ **API Key Protection** - Server-side only
- ✅ **Webhook Verification** - HMAC signature validation
- ✅ **Environment Variables** - Secure configuration
- ✅ **Input Validation** - Sanitized user inputs
- ✅ **Error Handling** - Graceful failure management

## 🚨 **Important Notes**

### **For Development:**
- Uses `localhost:3001` to avoid conflicts with FetanPay server (port 3003)
- SQLite database for simplicity
- Console logging for debugging

### **For Production:**
- Replace SQLite with PostgreSQL/MySQL
- Add proper error logging
- Implement rate limiting
- Add user authentication
- Use HTTPS for webhooks

## 📞 **Support**

If you encounter issues:
1. Check `.env.local` configuration
2. Verify FetanPay server is running (port 3003)
3. Ensure webhook URL is accessible
4. Check console logs for errors

## 🎉 **Ready to Learn!**

This sample app provides a complete, working example of FetanPay integration. Use it to:
- **Understand** the integration flow
- **Test** your FetanPay setup
- **Learn** best practices
- **Build** your own integration

Happy coding! ☕🚀