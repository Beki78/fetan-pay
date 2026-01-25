import type { NextApiRequest, NextApiResponse } from 'next';
import { getSimpleDatabase } from '../../../lib/simple-database';
import { generatePaymentReference } from '../../../lib/fetanpay';
import { ApiResponse, Order } from '../../../lib/types';

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
    const {
      customerName,
      customerEmail,
      items,
      total,
      paymentProvider,
      shippingAddress
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !items || !total || !paymentProvider) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart cannot be empty'
      });
    }

    // Validate total amount
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid total amount'
      });
    }

    const db = getSimpleDatabase();
    
    // Create order
    const order = await db.createOrder({
      customerName,
      customerEmail,
      items,
      total,
      status: 'PENDING',
      paymentProvider,
      shippingAddress
    });

    // Generate payment reference
    const paymentReference = generatePaymentReference(order.id);
    
    // Update order with payment reference
    await db.updateOrderStatus(order.id, 'PAYMENT_PENDING', paymentReference);

    // Get updated order
    const updatedOrder = await db.getOrder(order.id);

    // Log order creation
    await db.logPaymentEvent(order.id, 'ORDER_CREATED', {
      orderId: order.id,
      customerEmail,
      total,
      paymentProvider,
      paymentReference
    });

    console.log(`✅ Order created: ${order.id} for ${customerEmail} - ${paymentReference}`);

    res.status(201).json({
      success: true,
      data: updatedOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
}