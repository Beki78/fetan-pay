import type { NextApiRequest, NextApiResponse } from 'next';
import { getSimpleDatabase } from '../../../lib/simple-database';
import { createFetanPayClient } from '../../../lib/fetanpay';
import { ApiResponse, PaymentResponse } from '../../../lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaymentResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { orderId, reference, amount } = req.body;

    // Validate required fields
    if (!orderId || !reference || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, reference, amount'
      });
    }

    const db = getSimpleDatabase();
    
    // Get order to verify it exists and get payment provider
    const order = await db.getOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Create FetanPay client (server-side only)
    const fetanpay = createFetanPayClient();

    // Verify payment with FetanPay
    const paymentResult = await fetanpay.verifyPayment({
      orderId,
      provider: order.paymentProvider as any,
      reference,
      amount
    });

    // Log payment verification attempt
    await db.logPaymentEvent(orderId, 'PAYMENT_VERIFICATION', {
      orderId,
      reference,
      amount,
      provider: order.paymentProvider,
      result: paymentResult
    });

    // Update order status based on payment result
    if (paymentResult.status === 'VERIFIED') {
      await db.updateOrderStatus(orderId, 'PAID');
      
      // Log successful payment
      await db.logPaymentEvent(orderId, 'PAYMENT_VERIFIED', {
        orderId,
        reference,
        payment: paymentResult.payment
      });

      console.log(`✅ Payment verified for order ${orderId}: ${reference}`);
    } else {
      console.log(`❌ Payment verification failed for order ${orderId}: ${reference}`, paymentResult.checks);
    }

    res.status(200).json({
      success: true,
      data: paymentResult,
      message: paymentResult.status === 'VERIFIED' ? 'Payment verified successfully' : 'Payment verification failed'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Log error
    if (req.body.orderId) {
      try {
        const db = getSimpleDatabase();
        await db.logPaymentEvent(req.body.orderId, 'PAYMENT_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error',
          orderId: req.body.orderId,
          reference: req.body.reference
        });
      } catch (logError) {
        console.error('Failed to log payment error:', logError);
      }
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed'
    });
  }
}