# 🚀 FetanPay Coffee Shop - Complete Setup Guide

This guide will walk you through setting up the sample e-commerce application with FetanPay integration.

## 📋 **Prerequisites**

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **FetanPay server** running on port 3003
- **FetanPay API key** and **webhook secret**

## 🛠️ **Step-by-Step Setup**

### **Step 1: Navigate to Project Directory**
```bash
cd sample-ecommerce
```

### **Step 2: Install Dependencies**
```bash
npm install --legacy-peer-deps
```

**Note:** We use `--legacy-peer-deps` to resolve ESLint version conflicts. This is safe for this demo application.

### **Step 3: Setup Environment Variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual FetanPay credentials:
```bash
# FetanPay Configuration
FETANPAY_API_URL=http://localhost:3003/api/v1
FETANPAY_API_KEY=fetan_live_sk_YOUR_ACTUAL_API_KEY_HERE
FETANPAY_WEBHOOK_SECRET=YOUR_ACTUAL_WEBHOOK_SECRET_HERE

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
DATABASE_URL=./database.sqlite
```

### **Step 4: Get Your FetanPay Credentials**

#### **Get API Key:**
1. Open **FetanPay Merchant Admin**: http://localhost:3000
2. Go to **Developer Tools** → **API Keys**
3. Click **"Create API Key"**
4. Copy the key (starts with `fetan_live_sk_`)
5. Paste it in `.env.local` as `FETANPAY_API_KEY`

#### **Get Webhook Secret:**
1. In **Merchant Admin**, go to **Developer Tools** → **Webhooks**
2. Click **"Create Webhook"**
3. Set URL: `http://localhost:3001/api/webhooks/fetanpay`
4. Select events: `payment.verified`, `payment.unverified`, `payment.duplicate`
5. Copy the secret from the response
6. Paste it in `.env.local` as `FETANPAY_WEBHOOK_SECRET`

### **Step 5: Setup Database**
```bash
npm run db:setup
```

You should see:
```
✅ Connected to SQLite database
✅ Orders table created/verified
✅ Payment logs table created/verified
✅ Sample order inserted/verified
✅ Database setup complete!
```

### **Step 6: Start Development Server**
```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3001, url: http://localhost:3001
```

### **Step 7: Open the Application**
Visit: **http://localhost:3001**

## 🧪 **Testing the Integration**

### **Test 1: Browse Products**
1. Visit http://localhost:3001
2. Browse the coffee products
3. Use search and filters
4. Add products to cart

### **Test 2: Complete Checkout**
1. Go to cart page
2. Click "Proceed to Checkout"
3. Fill in customer information
4. Select payment provider (e.g., CBE)
5. Click "Place Order"
6. You'll be redirected to order page

### **Test 3: Payment Instructions**
1. On the order page, you'll see payment instructions
2. Copy the payment reference
3. Note the payment amount

### **Test 4: API Payment Verification**
1. Click "Check Payment" button on order page
2. This calls the FetanPay API to verify payment
3. Since no actual payment was made, it will show "not verified"

### **Test 5: Webhook Integration**
1. Make an actual bank transfer (or use test data)
2. The webhook will automatically update the order status
3. Check the browser console for webhook logs

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **"Module not found" errors:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Database errors:**
```bash
# Delete database and recreate
rm database.sqlite
npm run db:setup
```

#### **Port conflicts:**
- Make sure FetanPay server is running on port 3003
- Make sure port 3001 is available for the sample app

#### **API key errors:**
- Verify your API key is correct in `.env.local`
- Make sure FetanPay server is running
- Check that the API key has proper permissions

#### **Webhook not working:**
- Verify webhook URL is accessible: `http://localhost:3001/api/webhooks/fetanpay`
- Check webhook secret in `.env.local`
- Look at browser console for webhook logs

## 📁 **Project Structure**

```
sample-ecommerce/
├── pages/
│   ├── index.tsx              # Home page (product catalog)
│   ├── cart.tsx               # Shopping cart
│   ├── checkout.tsx           # Checkout process
│   ├── orders/
│   │   ├── index.tsx          # Orders list
│   │   └── [id].tsx           # Order details
│   └── api/
│       ├── orders/            # Order management APIs
│       ├── payments/          # Payment verification APIs
│       └── webhooks/          # Webhook handlers
├── components/
│   ├── Layout.tsx             # Main layout component
│   └── ProductCard.tsx        # Product display component
├── lib/
│   ├── types.ts               # TypeScript definitions
│   ├── database.ts            # Database utilities
│   ├── fetanpay.ts            # FetanPay API client
│   └── products.ts            # Sample product data
└── styles/
    └── globals.css            # Tailwind CSS styles
```

## 🎯 **Key Integration Points**

### **1. API Integration (`lib/fetanpay.ts`)**
- FetanPay API client
- Payment verification
- Error handling
- Rate limiting awareness

### **2. Webhook Handling (`pages/api/webhooks/fetanpay.ts`)**
- Signature verification
- Event processing
- Order status updates
- Security validation

### **3. Database Integration (`lib/database.ts`)**
- Order management
- Payment logging
- Status tracking
- Event history

### **4. Frontend Integration**
- Real-time status updates
- Payment instructions
- Error handling
- User feedback

## 🔒 **Security Features**

- ✅ **API Key Protection** - Server-side only
- ✅ **Webhook Signature Verification** - HMAC-SHA256
- ✅ **Environment Variables** - Secure configuration
- ✅ **Input Validation** - Sanitized inputs
- ✅ **Error Handling** - Graceful failures

## 📊 **Monitoring & Debugging**

### **Console Logs:**
- Order creation events
- Payment verification attempts
- Webhook deliveries
- Error messages

### **Database Logs:**
- All events stored in `payment_logs` table
- Order status changes
- API interactions

### **Browser DevTools:**
- Network requests
- API responses
- Webhook events
- Error messages

## 🎉 **Success Indicators**

You'll know everything is working when:

1. ✅ **Products load** on the home page
2. ✅ **Cart functionality** works (add/remove items)
3. ✅ **Checkout process** completes successfully
4. ✅ **Order page** shows payment instructions
5. ✅ **API verification** calls work (even if payment not found)
6. ✅ **Webhook endpoint** responds to test calls
7. ✅ **Console logs** show integration events

## 🆘 **Getting Help**

If you encounter issues:

1. **Check the console** for error messages
2. **Verify environment variables** in `.env.local`
3. **Ensure FetanPay server** is running on port 3003
4. **Test API endpoints** directly with curl
5. **Check webhook delivery** in FetanPay admin

## 🎓 **Learning Objectives**

After completing this setup, you'll understand:

- ✅ **API Integration** - How to call FetanPay APIs
- ✅ **Webhook Security** - Signature verification process
- ✅ **Real-time Updates** - Event-driven architecture
- ✅ **Error Handling** - Graceful failure management
- ✅ **Database Integration** - Order and payment tracking
- ✅ **Frontend Integration** - User experience design

## 🚀 **Next Steps**

Once the demo is working:

1. **Explore the code** to understand the integration patterns
2. **Modify the products** to match your business
3. **Customize the UI** to match your brand
4. **Add user authentication** for production use
5. **Implement email notifications** for order updates
6. **Add inventory management** features
7. **Deploy to production** with proper security

Happy coding! ☕🚀