# 🚀 FetanPay Coffee Shop - Quick Start Guide

## 📋 What You'll Build
A complete e-commerce coffee shop with **real payment verification** using FetanPay. This isn't just a demo - it's a fully functional payment system that processes actual bank transfers in Ethiopia.

## ✨ Key Features
- ☕ **Ethiopian Coffee Catalog** - Browse authentic coffee products
- 🛒 **Shopping Cart** - Add items and manage quantities  
- 💳 **Real Payment Processing** - Actual bank transfer verification
- 📱 **Mobile-Friendly** - Works perfectly on phones and tablets
- 🔔 **Live Updates** - Real-time payment status via webhooks
- 📊 **Order Tracking** - Complete order management system

---

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment Variables
```bash
cp .env.local.example .env.local
```

**Edit `.env.local`** with your FetanPay credentials:
```env
# FetanPay Configuration (REQUIRED)
FETANPAY_API_URL=http://localhost:3003/api/v1
FETANPAY_API_KEY=fetan_live_sk_YOUR_API_KEY_HERE
FETANPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

> 💡 **Get Your API Keys**: Visit the FetanPay merchant admin panel to generate your API key and webhook secret

### Step 3: Initialize Database
```bash
npm run db:setup
```
This creates a simple JSON database with sample coffee products.

### Step 4: Start the Application
```bash
npm run dev
```

**🎉 That's it!** Visit: **http://localhost:3001**

---

## 🧪 Test the Payment Flow

### Quick Test (2 minutes)
1. **Browse Products** → Click "Add to Cart" on any coffee
2. **View Cart** → Click the cart icon (top right)
3. **Checkout** → Enter your name and address
4. **Place Order** → You'll see payment instructions
5. **Verify Payment** → Use test reference: `FT25347NSD0432348645`

### Expected Result
✅ **Payment Verified Successfully!** modal appears  
✅ Order status changes to "PAID"  
✅ Webhook events are logged in console

---

## 🏗️ How It Works

### Payment Flow Explained
```
Customer Journey:
1. Browse Coffee → 2. Add to Cart → 3. Checkout → 4. Bank Transfer → 5. Verify Payment

Technical Flow:
1. Order Created → 2. Payment Instructions → 3. Customer Pays → 4. API Verification → 5. Webhook Update
```

### Key Components
- **Frontend**: Next.js with React 19 and Tailwind CSS
- **Payment API**: FetanPay integration for Ethiopian banks
- **Database**: Simple JSON file (easy to understand)
- **Webhooks**: Real-time payment notifications

---

## 🔧 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orders` | POST | Create new order |
| `/api/orders/[id]` | GET | Get order details |
| `/api/payments/verify` | POST | Verify payment status |
| `/api/webhooks/fetanpay` | POST | Handle payment webhooks |

---

## 🧪 Advanced Testing

### Test Webhook Manually
```bash
curl -X POST http://localhost:3001/api/webhooks/fetanpay \
  -H "Content-Type: application/json" \
  -H "X-FetanPay-Signature: test-signature" \
  -d '{
    "type": "payment.verified",
    "data": {
      "payment": {
        "reference": "FT25347NSD04",
        "amount": 111,
        "status": "VERIFIED"
      }
    }
  }'
```

### Test Different Scenarios
- ✅ **Successful Payment**: Use reference `FT25347NSD0432348645`
- ❌ **Failed Payment**: Use any invalid reference
- 🔄 **Pending Payment**: Create order and don't verify

---

## 🚀 Production Deployment

### Environment Setup
```env
# Production Environment
FETANPAY_API_URL=https://api.fetanpay.com/v1
FETANPAY_API_KEY=fetan_live_sk_YOUR_PRODUCTION_KEY
FETANPAY_WEBHOOK_SECRET=YOUR_PRODUCTION_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deploy Commands
```bash
npm run build
npm start
```

---

## 🛠️ Customization Guide

### Add New Products
Edit `lib/products.ts`:
```javascript
{
  id: 'new-coffee',
  name: 'New Ethiopian Coffee',
  price: 500,
  description: 'Amazing coffee description',
  category: 'Single Origin',
  inStock: true
}
```

### Modify Payment Instructions
Edit `lib/fetanpay.ts` → `getPaymentInstructions()` function

### Change Styling
- **Colors**: Edit `tailwind.config.js`
- **Layout**: Modify components in `components/` folder
- **Global Styles**: Update `styles/globals.css`

---

## 🐛 Troubleshooting

### Common Issues

**❌ "FETANPAY_API_KEY not configured"**
- Solution: Add your API key to `.env.local`

**❌ "Payment verification failed"**
- Check: API key is correct
- Check: FetanPay server is running on port 3003

**❌ "Webhook not working"**
- Check: Webhook secret matches
- Check: Webhook URL is accessible

**❌ "Styles not loading"**
- Run: `npm install` again
- Check: Tailwind CSS is properly configured

### Debug Mode
Add to `.env.local`:
```env
NODE_ENV=development
DEBUG=true
```

---

## 📚 Learn More

### Key Files to Understand
- `pages/index.tsx` - Product catalog page
- `pages/checkout.tsx` - Checkout process
- `pages/orders/[id].tsx` - Order details and payment
- `lib/fetanpay.ts` - Payment integration logic
- `components/PaymentVerificationModal.tsx` - Payment result display

### Architecture Overview
```
Frontend (Next.js)
    ↓
API Routes (/api/*)
    ↓
FetanPay API (Payment Processing)
    ↓
Webhooks (Real-time Updates)
    ↓
Simple Database (JSON file)
```

---

## 🆘 Support & Resources

- 📧 **Email**: support@fetanpay.com
- 📚 **Full Documentation**: https://docs.fetanpay.com
- 🔧 **API Reference**: https://docs.fetanpay.com/api
- 🐛 **Report Issues**: Create GitHub issue
- 💬 **Community**: Join our developer Discord

---

## 📄 License
MIT License - Feel free to use this code in your projects!

---

**🎯 Ready to integrate FetanPay into your own application?** This sample provides all the building blocks you need for a production-ready payment system.