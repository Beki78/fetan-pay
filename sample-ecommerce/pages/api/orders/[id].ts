import type { NextApiRequest, NextApiResponse } from 'next';
import { getSimpleDatabase } from '../../../lib/simple-database';
import { ApiResponse } from '../../../lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid order ID'
    });
  }

  if (req.method === 'GET') {
    try {
      const db = getSimpleDatabase();
      const order = await db.getOrder(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get order'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}