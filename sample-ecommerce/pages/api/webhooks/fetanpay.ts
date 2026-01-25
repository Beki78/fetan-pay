import type { NextApiRequest, NextApiResponse } from 'next';
import { getSimpleDatabase } from '../../../lib/simple-database';
import { verifyWebhookSignature } from '../../../lib/fetanpay';
import { ApiResponse } from '../../../lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const signature = req.headers['x-fetanpay-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Handle different webhook payload structures
    let event: string, data: any;
    
    if (req.body.event && req.body.data) {
      // Standard webhook format: { event: "payment.verified", data: {...} }
      event = req.body.event;
      data = req.body.data;
    } else if (req.body.type && req.body.data) {
      // FetanPay webhook format: { type: "payment.verified", data: {...} }
      event = req.body.type;
      data = req.body.data;
    } else if (req.body.payment) {
      // Direct payment webhook: { payment: {...}, merchant: {...} }
      event = req.body.payment.status === 'VERIFIED' ? 'payment.verified' : 'payment.unverified';
      data = {
        orderId: req.body.orderId || 'unknown',
        reference: req.body.payment.reference,
        payment: req.body.payment
      };
    } else {
      console.log('⚠️ Unknown webhook payload structure:', req.body);
      event = 'unknown';
      data = req.body;
    }

    console.log(`🔔 Webhook received: ${event}`, data);

    const db = getSimpleDatabase();

    switch (event) {
      case 'payment.verified':
        await handlePaymentVerified(data, db);
        break;
      
      case 'payment.unverified':
        await handlePaymentUnverified(data, db);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(data, db);
        break;
      
      default:
        console.log(`ℹ️ Unhandled webhook event: ${event}`);
    }

    // Log webhook event
    if (data.orderId) {
      await db.logPaymentEvent(data.orderId, `WEBHOOK_${event.toUpperCase()}`, {
        event,
        data,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
}

async function handlePaymentVerified(data: any, db: any) {
  const { payment } = data;
  const reference = payment?.reference;
  
  if (!reference) {
    console.log('❌ No payment reference in webhook data');
    return;
  }
  
  console.log(`✅ Payment verified via webhook: ${reference}`);
  
  // Find order by transaction reference (from payment logs)
  const order = await db.getOrderByTransactionReference(reference);
  if (!order) {
    console.log(`⚠️ No order found for transaction reference: ${reference}`);
    return;
  }
  
  // Update order status
  await db.updateOrderStatus(order.id, 'PAID');
  
  // Log successful payment
  await db.logPaymentEvent(order.id, 'PAYMENT_VERIFIED_WEBHOOK', {
    orderId: order.id,
    transactionReference: reference,
    payment,
    timestamp: new Date().toISOString()
  });
  
  console.log(`✅ Order ${order.id} marked as PAID via webhook for transaction ${reference}`);
}

async function handlePaymentUnverified(data: any, db: any) {
  const { payment } = data;
  const reference = payment?.reference;
  
  if (!reference) {
    console.log('❌ No payment reference in webhook data');
    return;
  }
  
  console.log(`❌ Payment unverified via webhook: ${reference}`);
  
  // Find order by transaction reference
  const order = await db.getOrderByTransactionReference(reference);
  if (!order) {
    console.log(`⚠️ No order found for transaction reference: ${reference}`);
    return;
  }
  
  // Log unverified payment
  await db.logPaymentEvent(order.id, 'PAYMENT_UNVERIFIED_WEBHOOK', {
    orderId: order.id,
    transactionReference: reference,
    payment,
    timestamp: new Date().toISOString()
  });
}

async function handlePaymentFailed(data: any, db: any) {
  const { payment } = data;
  const reference = payment?.reference;
  
  if (!reference) {
    console.log('❌ No payment reference in webhook data');
    return;
  }
  
  console.log(`💥 Payment failed via webhook: ${reference}`);
  
  // Find order by transaction reference
  const order = await db.getOrderByTransactionReference(reference);
  if (!order) {
    console.log(`⚠️ No order found for transaction reference: ${reference}`);
    return;
  }
  
  // Update order status
  await db.updateOrderStatus(order.id, 'CANCELLED');
  
  // Log failed payment
  await db.logPaymentEvent(order.id, 'PAYMENT_FAILED_WEBHOOK', {
    orderId: order.id,
    transactionReference: reference,
    payment,
    timestamp: new Date().toISOString()
  });
}