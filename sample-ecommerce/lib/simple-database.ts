import fs from 'fs';
import path from 'path';
import { Order, OrderStatus, CartItem } from './types';

const dbPath = path.join(process.cwd(), 'simple-db.json');

interface SimpleDB {
  orders: Record<string, Order>;
  paymentLogs: Array<{
    id: string;
    orderId: string;
    eventType: string;
    payload: any;
    createdAt: string;
  }>;
}

class SimpleDatabase {
  private data: SimpleDB;

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = { orders: {}, paymentLogs: [] };
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = { orders: {}, paymentLogs: [] };
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();
    
    const newOrder: Order = {
      id: orderId,
      ...order,
      createdAt: now,
      updatedAt: now
    };

    this.data.orders[orderId] = newOrder;
    this.saveData();
    
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.data.orders[id] || null;
  }

  async updateOrderStatus(id: string, status: OrderStatus, paymentReference?: string): Promise<void> {
    const order = this.data.orders[id];
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      if (paymentReference) {
        order.paymentReference = paymentReference;
      }
      this.saveData();
    }
  }

  async getOrderByPaymentReference(reference: string): Promise<Order | null> {
    return this.data.orders[reference] || null;
  }

  async getOrderByTransactionReference(transactionRef: string): Promise<Order | null> {
    // Search through payment logs to find which order used this transaction reference
    const logs = this.data.paymentLogs.filter(log => 
      log.eventType === 'PAYMENT_VERIFICATION' && 
      log.payload?.reference === transactionRef
    );
    
    if (logs.length > 0) {
      const orderId = logs[logs.length - 1].orderId; // Get the most recent
      return this.data.orders[orderId] || null;
    }
    
    return null;
  }

  async logPaymentEvent(orderId: string, eventType: string, payload: any): Promise<void> {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      orderId,
      eventType,
      payload,
      createdAt: new Date().toISOString()
    };

    this.data.paymentLogs.push(logEntry);
    this.saveData();
  }

  async getAllOrders(limit = 50): Promise<Order[]> {
    const orders = Object.values(this.data.orders);
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  close(): void {
    // No-op for simple database
  }
}

// Singleton instance
let dbInstance: SimpleDatabase | null = null;

export function getSimpleDatabase(): SimpleDatabase {
  if (!dbInstance) {
    dbInstance = new SimpleDatabase();
  }
  return dbInstance;
}

export default SimpleDatabase;