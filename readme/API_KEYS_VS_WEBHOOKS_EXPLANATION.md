# API Keys vs Webhooks - Simple Explanation

## Quick Summary
- **API Keys** = Your e-commerce site calls FetanPay to verify payments
- **Webhooks** = FetanPay calls your e-commerce site to notify about payments

---

## 🔑 API Keys - When YOU Call FetanPay

### What is it?
An API key is like a password that lets your e-commerce website make requests to FetanPay's servers.

### When do you use it?
**When your e-commerce site needs to ASK FetanPay: "Did this payment happen?"**

### Example Scenario:
1. Customer buys a product on your e-commerce site for 500 ETB
2. Customer pays via CBE mobile banking
3. Your e-commerce site needs to know: "Did the payment go through?"
4. **Your site uses the API key** to call FetanPay: "Hey, did payment reference FT12345 get verified?"
5. FetanPay responds: "Yes, it's verified! Amount: 500 ETB"

### Real Code Example:
```javascript
// Your e-commerce site makes this call
fetch('https://api.fetanpay.et/api/v1/payments/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'CBE',
    reference: 'FT12345',
    claimedAmount: 500.00
  })
})
```

### When to use API Keys:
- ✅ When you want to **manually check** if a payment was verified
- ✅ When you want to **verify payments on-demand** (like when customer clicks "Check Payment Status")
- ✅ When you're building a **custom integration** where you control when to check

---

## 🔔 Webhooks - When FetanPay Calls YOU

### What is it?
A webhook is like a phone number where FetanPay can call your e-commerce site to tell you about payments automatically.

### When do you use it?
**When you want FetanPay to AUTOMATICALLY notify your site when payments happen.**

### Example Scenario:
1. Customer buys a product on your e-commerce site for 500 ETB
2. Customer pays via CBE mobile banking
3. **FetanPay automatically detects the payment**
4. **FetanPay calls your webhook URL** (like: `https://yoursite.com/webhooks/fetanpay`)
5. Your site receives: "Hey! Payment FT12345 was just verified! Amount: 500 ETB"
6. Your site automatically updates the order status to "Paid" and sends confirmation email

### Real Code Example:
```javascript
// Your e-commerce site receives this webhook (on your server)
app.post('/webhooks/fetanpay', (req, res) => {
  // Verify the signature first (security!)
  const signature = req.headers['x-fetanpay-signature'];
  const isValid = verifySignature(req.body, signature, webhookSecret);
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  const event = req.body;
  
  if (event.type === 'payment.verified') {
    const payment = event.data.payment;
    
    // Update order status in your database
    updateOrderStatus(payment.reference, 'PAID');
    
    // Send confirmation email to customer
    sendConfirmationEmail(payment.reference);
    
    // Update inventory
    reduceInventory(payment.reference);
  }
  
  // Always respond quickly
  res.status(200).send('OK');
});
```

### When to use Webhooks:
- ✅ When you want **automatic, real-time notifications**
- ✅ When you want to **update orders automatically** without manual checks
- ✅ When you want **instant confirmation** emails to customers
- ✅ When you want **background processing** (don't want to wait/poll)

---

## 🤔 Which One Do You Need?

### Option 1: API Keys Only
**Use this if:**
- You want to check payments manually
- You have a simple system
- You don't need instant notifications
- You're okay with checking periodically

**Example:** Small shop that checks payments every few minutes

### Option 2: Webhooks Only
**Use this if:**
- You want automatic, instant notifications
- You want orders to update automatically
- You have a server that can receive webhooks

**Example:** Modern e-commerce site that needs instant order updates

### Option 3: Both (Recommended for Most Cases)
**Use this if:**
- You want automatic notifications (webhooks) **AND**
- You want to manually verify payments when needed (API keys)
- You want redundancy (if webhook fails, you can still check with API)

**Example:** Professional e-commerce site that needs both automatic updates and manual verification

---

## 📊 Comparison Table

| Feature | API Keys | Webhooks |
|---------|----------|----------|
| **Direction** | Your site → FetanPay | FetanPay → Your site |
| **When** | When YOU want to check | When payment happens |
| **Speed** | You control timing | Instant/automatic |
| **Setup** | Just need the key | Need a public URL endpoint |
| **Use Case** | Manual verification | Automatic notifications |
| **Best For** | Simple integrations | Real-time systems |

---

## 🏗️ How an E-commerce Site Would Use Both

### Typical Flow:

1. **Customer places order** on your e-commerce site
2. **Your site generates payment QR code** (using FetanPay API with API key)
3. **Customer scans and pays**
4. **FetanPay sends webhook** to your site → Order automatically marked as "Paid"
5. **If webhook fails** → Your site can use API key to check payment status manually
6. **Customer receives confirmation** email automatically

### Code Structure:

```javascript
// 1. Generate payment (using API key)
async function createPayment(orderId, amount) {
  const response = await fetch('https://api.fetanpay.et/api/v1/payments/create', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({ amount, orderId })
  });
  return response.json();
}

// 2. Receive webhook (automatic notification)
app.post('/webhooks/fetanpay', async (req, res) => {
  // Verify signature
  if (!verifySignature(req)) {
    return res.status(401).send('Invalid');
  }
  
  // Process payment notification
  if (req.body.type === 'payment.verified') {
    await markOrderAsPaid(req.body.data.payment.reference);
    await sendConfirmationEmail(req.body.data.payment.reference);
  }
  
  res.status(200).send('OK');
});

// 3. Fallback: Manual check (using API key)
async function checkPaymentStatus(reference) {
  const response = await fetch('https://api.fetanpay.et/api/v1/payments/verify', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({ reference })
  });
  return response.json();
}
```

---

## 🎯 Recommendation for E-commerce Sites

**Use BOTH:**
1. **Webhooks** for automatic, real-time order updates (primary method)
2. **API Keys** for:
   - Manual verification when needed
   - Fallback if webhook fails
   - Customer "Check Payment Status" button
   - Admin dashboard to verify payments

This gives you:
- ✅ Automatic updates (webhooks)
- ✅ Manual control (API keys)
- ✅ Redundancy (if one fails, use the other)
- ✅ Better user experience

---

## 🔒 Security Notes

### API Keys:
- Keep secret! Never expose in frontend JavaScript
- Use only on your backend server
- Rotate if compromised

### Webhooks:
- Always verify the signature using the webhook secret
- Use HTTPS for your webhook endpoint
- Return 200 status quickly (process in background)

---

## 📝 Summary

**API Keys** = "Hey FetanPay, did this payment happen?" (You ask)
**Webhooks** = "Hey Your Site, a payment just happened!" (FetanPay tells you)

**For e-commerce:** Use both! Webhooks for automatic updates, API keys for manual checks and fallback.

